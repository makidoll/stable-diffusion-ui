const areWorkingXTo = [
	"really hard",
	"very carefully",
	"so diligently",
	"all night",
	"tirelessly",
	"throughout lunch",
	"over the weekend",
	"overtime",
	"nonstop",
	"really gladly",
	"super earerly",
	"very softly",
	"curiously",
	"full of interest",
	"at great personal expense",
	"with Chester",
	"with Lobstertje",
	"with Eentje",
	"with Flumpietje",
];

export function getRandomAreWorkingXTo(amount: number): string[] {
	const found = [""];
	for (let i = 0; i < amount; i++) {
		let current = "";
		while (found.includes(current)) {
			current =
				areWorkingXTo[Math.floor(Math.random() * areWorkingXTo.length)];
		}
		found.push(current);
	}
	found.splice(0, 1);
	return found;
}
