"use strict";
import { connect as _connect, Connection, InputStream } from "mumble";
import Queue from "./queue";
import { readFileSync } from "fs";
import Mixer from "audio-mixer";
import dbconn from "../database";
import config from "../../config-loader";
import { h } from "preact";
import { render } from "preact-render-to-string";

import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import normaliseSong from "../../shared/util/normalise-song";
import BbcCommand from "./commands/BbcCommand";
import MemeCommand from "./commands/MemeCommand";
import NoCommand from "./commands/NoCommand";
import PurgeCommand from "./commands/PurgeCommand";
import RandomSongCommand from "./commands/RandomSongCommand";
import StopCommand from "./commands/StopCommand";
import VolumeCommand from "./commands/VolumeCommand";
import YesCommand from "./commands/YesCommand";
import YoutubeCommand from "./commands/YoutubeCommand";
import BaseCommand from "./commands/BaseCommand";
import { Collection, Db } from "mongodb";
import { ffprobe } from "fluent-ffmpeg/lib/fluent-ffmpeg";

import { expose } from "threads/worker";
import { Observable } from "observable-fns";

const options = {
  key: readFileSync("./data/key.pem").toString(),
  cert: readFileSync("./data/cert.pem").toString(),
};

const DEFAULT_VOL = 0.125;

const { server, username, password } = config;

export class Mumble {
  currentFile: ffmpeg.FfmpegCommand;
  inputStream: InputStream;

  mixer: any = new Mixer({
    channels: 2,
    sampleRate: 44100,
  });

  playingSong: any = {};
  yesVotes: string[] = [];
  noVotes: string[] = [];
  queue = new Queue();
  voteHappening = false;
  currentVolume = DEFAULT_VOL;
  db: Collection = null;
  commands: BaseCommand[] = [];
  client: Connection;
  connected: boolean;
  playing: boolean;
  sendToMaster: any;

  constructor() {
    this.commands.push(new YesCommand(this));
    this.commands.push(new NoCommand(this));
    this.commands.push(new YoutubeCommand(this));
    this.commands.push(new PurgeCommand(this));
    this.commands.push(new StopCommand(this));
    this.commands.push(new VolumeCommand(this));
    this.commands.push(new RandomSongCommand(this));

    this.commands.push(new BbcCommand(this));
    this.commands.push(new MemeCommand(this));
  }

  setObserver(observer: any) {
    this.sendToMaster = observer;
  }

  connect() {
    dbconn((err: any, data: Db) => {
      if (err !== null) {
        return;
      }

      this.db = data.collection("songs");
    });

    console.log("Connecting");

    _connect(server, options, (error, connection) => {
      if (error) {
        console.log(error);
        throw error;
      }

      console.log("Connected");

      connection.authenticate(username, password);
      this.client = connection;

      connection.on("initialized", () => {
        console.log("Connection initialized");
        this.sendMessage("...aaaaaand we're back!");
        this.sendMessage("Loaded MumbleBot!");
        // @ts-ignore because the types for the mumble lib are incomplete
        this.client.connection.sendMessage("UserState", {
          session: this.client.user.session,
          actor: this.client.user.session,
          comment: render(
            <div>
              <h1>Welcome to MumbleBot</h1>
              <p>
                To request a song, head to{" "}
                <a href="http://rymate.co.uk/mumble/">
                  http://rymate.co.uk/mumble/
                </a>
              </p>
            </div>
          ),
        });
      });

      // @ts-ignore because the types for the mumble lib are incomplete
      this.inputStream = this.client.inputStream({
        channels: 2,
        sampleRate: 44100,
        gain: this.currentVolume,
      });
      this.mixer.pipe(this.inputStream);

      // On text message...
      connection.on("message", (message, user) => {
        const format = (date: Date) =>
          `${date.getDate()}/${
            date.getMonth() + 1
          }/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

        try {
          console.log(`${format(new Date())} <${user.name}> ${message}`);
          this.handleMessage(message, user);
        } catch (e) {
          console.error(e);
        }
      });

      this.connected = true;
    });
  }

  getStatus() {
    var status: any = {};
    status.playing = this.playing;
    status.nowPlaying = this.playingSong.name || this.playingSong.title;
    status.queue = this.queue.getArray();
    status.users = this.client && this.client.users().map((user) => user.name);
    status.voteHappening = this.voteHappening;

    return status;
  }

  setComment() {
    var message;
    if (this.playingSong) {
      message = (
        <div>
          <h1>Now Playing:</h1>
          <p>{this.playingSong.name || this.playingSong.title}</p>
          <p>
            To request a song, head to{" "}
            <a href="http://rymate.co.uk/mumble/">
              http://rymate.co.uk/mumble/
            </a>
          </p>
        </div>
      );
    } else {
      message = (
        <div>
          <h1>No songs currently playing</h1>
          <p>
            To request a song, head to{" "}
            <a href="http://rymate.co.uk/mumble/">
              http://rymate.co.uk/mumble/
            </a>
          </p>
        </div>
      );
    }

    this.sendToMaster.next({ type: "update-stats" });

    // @ts-ignore because the types for the mumble lib are incomplete
    this.client.connection.sendMessage("UserState", {
      session: this.client.user.session,
      actor: this.client.user.session,
      comment: render(message),
    });
  }

  sendMessage = (message) => {
    this.client.user.channel.sendMessage(message);
  };

  handleMessage(message, user) {
    const regex = /(<([^>]+)>)/gi;
    message = message.replace(regex, "").split(" ");
    const command = this.commands.find((c) => c.shouldExecute(message));

    if (command) {
      command.execute(message, user);
    }
  }

  stopSong = () => {
    if (typeof this.inputStream.close === "undefined") {
      return;
    }

    this.playing = false;
    this.playingSong.name = "";
    this.playingSong.input.destroy();
    this.setComment();

    this.currentFile.kill("");
    this.currentFile = null;

    setTimeout(() => {
      if (this.queue.getLength() !== 0) this.play(this.queue.dequeue());
    }, 2000);
  };

  callVote = async (filename) => {
    if (this.voteHappening) {
      return;
    }
    console.log(filename);
    let request;

    if (!filename.radio) {
      request = await new Promise((resolve, reject) =>
        this.db.find({ path: filename.path }).toArray((err, docs) => {
          if (err) {
            console.log(err);
            return reject(err);
          }

          var file = docs[0];
          console.log("file gotten", file);
          if (file == null) {
            return reject(new Error("File not found"));
          }

          file.name = file.title;
          file.name = escapeHtml(file.name);

          resolve(file);
        })
      );
    } else {
      request = filename;
    }

    const type = filename.radio ? "station" : "song";

    this.sendMessage(
      render(
        <p>
          Someone has requested the following {type}:{" "}
          {request.name || request.title}
          <br />
          Use voteyes and voteno to vote! 10 Seconds to vote...
        </p>
      )
    );
    this.handleVote(() => this.play(request));
  };

  handleVote = (callback) => {
    if (this.voteHappening) {
      return;
    }

    this.yesVotes = [];
    this.noVotes = [];
    this.voteHappening = true;
    this.sendToMaster.next({ type: "update-stats" });

    setTimeout(() => {
      if (this.yesVotes.length > this.noVotes.length) {
        this.sendMessage(
          "Vote success! Yes Votes: " +
            this.yesVotes.length +
            " - No Votes: " +
            this.noVotes.length
        );
        callback();
      } else if (this.yesVotes.length < this.noVotes.length) {
        this.sendMessage(
          "Vote failed! Yes Votes: " +
            this.yesVotes.length +
            " - No Votes: " +
            this.noVotes.length
        );
      } else if (this.yesVotes.length === 0 && this.noVotes.length === 0) {
        this.sendMessage("No-one cared! Passing vote anyway...");
        callback();
      } else {
        this.sendMessage(
          "Vote failed! Yes Votes: " +
            this.yesVotes.length +
            " - No Votes: " +
            this.noVotes.length
        );
      }

      this.voteHappening = false;
      this.yesVotes = [];
      this.noVotes = [];
    }, 10000);
  };

  play(filename) {
    if (!this.connected) {
      return;
    }

    if (this.playing) {
      this.queue.enqueue(filename);
      this.sendToMaster.next({ type: "update-stats" });
      return;
    }

    if (filename.radio) {
      ffprobe(filename.src.replace(";", ""), (err, metadata) => {
        if (err) {
          console.log(err);
          return;
        }
        this.currentFile = this.getFfmpegInstance(
          filename.src.replace(";", ""),
          () => {
            console.log("Finished");
            this.playingSong.name = "";
            this.sendToMaster.next({ type: "update-stats" });
          }
        );

        this.playingSong.name = filename.name || filename.title;
        this.setPlaying();

        this.playingSong.input = this.mixer.input({
          channels: 2,
          sampleRate: 44100,
        });

        this.currentFile.pipe(this.playingSong.input, { end: false });
      });
    } else {
      this.currentFile = this.getFfmpegInstance("data/uploads/" + filename.filename, () => {
        this.playing = false;
        if (this.queue.getLength() !== 0) {
          console.log("ended");
          this.playingSong.name = "";
          this.sendToMaster.next({ type: "update-stats" });
          this.play(this.queue.dequeue());
        }
      });

      this.playingSong.input = this.mixer.input({
        channels: 2,
        sampleRate: 44100,
      });

      this.currentFile.pipe(this.playingSong.input, { end: true });
      this.playingSong.name = filename.name || filename.title;
      this.setPlaying();
    }
  }

  getFfmpegInstance(filename, callback): ffmpeg.FfmpegCommand {
    return ffmpeg(filename)
      .audioChannels(2)
      .renice(5)
      .audioBitrate(128)
      .audioFrequency(44100)
      .format("wav")
      .on("error", function (err) {
        console.log(err);
      })
      .on("end", () => callback());
  }

  setPlaying() {
    const message = (
      <p>
        Now Playing: {this.playingSong.name}
        <br />
        To call a vote to stop it, type stopsong in chat.
      </p>
    );
    this.sendMessage(render(message));
    this.setComment();
    this.playing = true;
  }

  uploadYoutube = async (url, request) => {
    if (!url.startsWith("http")) return;
    try {
      const video = await ytdl.getInfo(url);
      const youtube = ytdl.downloadFromInfo(video);
      const info = video.videoDetails;
      const path = "data/uploads/" + info.videoId;
      const count = await this.db.find({ path }).count();

      if (count === 0) {
        console.log("file doesn't exist");
        const save = ffmpeg(youtube)
          .format("mp3")
          .on("error", (err, stdout, stderr) => {
            console.log("Cannot process video: ", err);
            this.sendMessage("Cannot process video: " + err.message);
          })
          .on("end", () => {
            let details: any = {};
            const metadata: any = {};

            metadata.title = info.title;
            metadata.artist = info.author.name;

            details.metadata = metadata;

            details.filename = info.videoId;
            details.date = new Date();

            details.originalname = url;
            details.path = path;

            details = normaliseSong(details);

            this.db.insertOne(details, (err, result) => {
              if (!err) {
                console.log("Finished processing");
                this.sendToMaster.next({
                  type: "add-song",
                  song: result.ops[0],
                });

                if (request) this.callVote({ path });
              }
            });
          });
        save.save("./data/uploads/" + info.videoId);
      } else if (request) {
        console.log("file exist, requests");
        this.callVote({ path });
      } else {
        console.log("file exist");
      }
    } catch (e) {
      console.log(e);
    }
  };
}

var entityMap = {
  "&": "&",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "/",
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'/]/g, (s) => {
    return entityMap[s];
  });
}

let mumbleClient = null;

const object = {
  initialise() {
    if (mumbleClient === null) {
      try {
        mumbleClient = new Mumble();
        mumbleClient.connect();
      } catch (e) {
        throw e;
      }
    }

    return new Observable((observer) => {
      mumbleClient.setObserver(observer);
    });
  },
  status() {
    return mumbleClient.getStatus();
  },
  request(payload) {
    if (mumbleClient.voteHappening) {
      return;
    }

    mumbleClient.callVote(payload);
  },
  youtube(payload) {
    if (mumbleClient.voteHappening) {
      return;
    }

    mumbleClient.uploadYoutube(payload, false);
  },
};

expose(object);
