/*
 * Creates a new queue. A queue is a first-in-first-out (FIFO) data structure -
 * items are added to the end of the queue and removed from the front.
 * 
 * Based off code from http://code.iamkate.com/javascript/queues/
 */
function Queue () {
  // initialise the queue and offset
  let queue = [];
  let offset = 0;

  // Returns the length of the queue.
  this.getLength = () => queue.length - offset

  // Returns true if the queue is empty, and false otherwise.
  this.isEmpty = () => queue.length === 0

  /* Enqueues the specified item. The parameter is:
   *
   * item - the item to enqueue
   */
  this.enqueue = item => {
    queue.push(item)
  }

  /* Dequeues an item and returns it. If the queue is empty, the value
   * 'undefined' is returned.
   */
  this.dequeue = () => {
    // if the queue is empty, return immediately
    if (queue.length === 0) return undefined

    // store the item at the front of the queue
    const item = queue[offset];

    // increment the offset and remove the free space if necessary
    if (++offset * 2 >= queue.length) {
      queue = queue.slice(offset)
      offset = 0
    }

    // return the dequeued item
    return item
  }

  this.getArray = () => queue.slice(offset)

  /* Returns the item at the front of the queue (without dequeuing it). If the
   * queue is empty then undefined is returned.
   */
  this.peek = () => queue.length > 0 ? queue[offset] : undefined
}
export default Queue;
