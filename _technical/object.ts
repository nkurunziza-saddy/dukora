/* eslint-disable @typescript-eslint/no-unused-vars */
// --- Objects ---

// Creating an object
const user = { name: "Alice", age: 25, active: true };

// Accessing properties
console.log(user.name); // "Alice"

// Object utilities
console.log(Object.keys(user)); // ["name", "age", "active"]
console.log(Object.values(user)); // ["Alice", 25, true]
console.log(Object.entries(user)); // [["name", "Alice"], ["age", 25], ["active", true]]

// Iterating over object properties
for (const key in user) {
  if (Object.prototype.hasOwnProperty.call(user, key)) {
    console.log(key, user[key as keyof typeof user]);
  }
}

// Object destructuring
const user2 = { id: 42, name: "Charlie", email: "c@example.com" };
const { id, email } = user2;
console.log(id, email); // 42 "c@example.com"

// Renaming and default values in destructuring
const { name: username, age = 30 } = { name: "Dana" };
console.log(username, age); // "Dana" 30

// Shallow copy with spread
const original = { a: 1, b: { x: 10 } };
const copy = { ...original };
copy.b.x = 20;
console.log(original.b.x); // 20 (shallow copy: nested objects are shared)

// Deep copy (simple way)
const deepCopy = JSON.parse(JSON.stringify(original));
deepCopy.b.x = 100;
console.log(original.b.x); // 20 (original unchanged)

// TIP: For deep cloning with functions or special types, use libraries like lodash's _.cloneDeep

// --- Arrays ---

const numbers = [1, 6, 10, 3];

// Iterating
for (const n of numbers) {
  console.log(n);
}

// Array utilities
const squares = numbers.map((n) => n * n); // [1, 36, 100, 9]
const big = numbers.filter((n) => n > 5); // [6, 10]
const firstBig = numbers.find((n) => n > 2); // 6
const hasLarge = numbers.some((n) => n > 100); // false
const allPositive = numbers.every((n) => n >= 1); // true
const sum = numbers.reduce((acc, n) => acc + n, 0); // 20

// Adding/removing elements
numbers.push(1500); // adds to end
numbers.pop(); // removes from end
numbers.unshift(0); // adds to start
numbers.shift(); // removes from start

// Spread operator
const nums = [1, 2, 3];
const nums2 = [...nums, 4, 5]; // [1, 2, 3, 4, 5]

// Array destructuring
const rgb = [255, 100, 75];
const [r, g, b] = rgb;
console.log(r, g, b); // 255 100 75

// Skipping elements in destructuring
const [first, , third] = numbers;
console.log(first, third);

// Rest operator in destructuring
const [head, ...tail] = numbers;
console.log(head, tail);

// Sorting and reversing
const sorted = [...numbers].sort((a, b) => a - b);
const reversed = [...numbers].reverse();

// Removing duplicates
const unique = Array.from(new Set(numbers));

// TIP: Use Array.isArray(value) to check if a value is an array

// --- Extra Utilities ---

// Merging objects
const defaults = { a: 1, b: 2 };
const settings = { ...defaults, b: 20, c: 3 }; // { a:1, b:20, c:3 }

// Merging arrays
const arr1 = [1, 2];
const arr2 = [3, 4];
const merged = [...arr1, ...arr2]; // [1, 2, 3, 4]

// Finding index
const idx = numbers.indexOf(10); // 2

// Removing by index
const removed = numbers.filter((_, i) => i !== idx);

// TIP: Use .at(-1) to get the last element (ES2022+)
console.log(numbers.at(-1));

// --- Summary Tips ---
// - Use spread (...) for shallow copies and merging
// - Use destructuring for concise extraction of values
// - Use array methods (map, filter, reduce, etc.) for functional-style code
// - For deep cloning, prefer libraries for complex objects
// - Always check for array/object types before operations
