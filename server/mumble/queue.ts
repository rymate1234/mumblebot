/*
 * Creates a new queue. A queue is a first-in-first-out (FIFO) data structure -
 * items are added to the end of the queue and removed from the front.
 *
 * Based off code from http://code.iamkate.com/javascript/queues/
 */

class Queue<T> {
  private queue: T[] = []
  private offset: number = 0

  getLength(): number {
    return this.queue.length - this.offset
  }

  isEmpty(): Boolean {
    return this.queue.length === 0
  }

  enqueue(item: T): void {
    this.queue.push(item)
  }

  dequeue(): T { 
    // if the queue is empty, return immediately
    if (this.queue.length === 0) return undefined

    // store the item at the front of the queue
    const item = this.queue[this.offset]

    // increment the offset and remove the free space if necessary
    if (++this.offset * 2 >= this.queue.length) {
      this.queue = this.queue.slice(this.offset)
      this.offset = 0
    }

    // return the dequeued item
    return item
  }

  getArray(): T[] {
    return this.queue.slice(this.offset)
  }

  peek(): T {
    return this.queue.length > 0 ? this.queue[this.offset] : undefined
  }

  reset(): void {
    this.queue = []
    this.offset = 0
  }
}

export default Queue
