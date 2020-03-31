class QNode {
  constructor(val) {
    this.next = null;
    this.val = val;
  }
}

class Queue {
  constructor() {
    this.head = null;
    this.tail = null;
    this.len = 0;
  }

  empty() {
    return this.head == null;
  }

  queue(val) {
    if (this.empty()) {
      this.head = new QNode(val);
      this.tail = this.head;
    } else {
      this.tail.next = new QNode(val);
      this.tail = this.tail.next;
    }
    this.len++;
  }
  dequeue() {
    if (!this.empty()) {
      let old = this.head;
      this.head = this.head.next;
      delete old;
      this.len--;
    }
  }

  size() {
    return this.len;
  }

  print() {
    var curr = this.head;
    var result = "front -> ";
    while (curr) {
      result += `${curr.val} --> `;
      curr = curr.next;
    }
    result += "Null";
    console.log(result);
  }

  peek() {
    if (this.empty()) return -1;
    else return this.head.val;
  }
}

module.exports.Queue = Queue;
