'use strict';
export default [
	[/^course\/(((?!catalog|content|mind).)*)$/, "course/index/detail?id=:1"],
	[/^course\/catalog\/(\S*)$/, "course/index/cataloglist?uid=:1"],
	[/^course\/content\/(\S*)$/, "course/index/content?id=:1"],
	[/^course\/mind\/(\S*)$/, "course/index/mind?id=:1"],
];