import Base from './base.js';
let fs = require('fs');

export default class extends Base {
  editorAction() {
    return this.display('editor');
  }
}