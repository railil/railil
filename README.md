# Bot

## Install

1. `npm install`
1. `$ cp .env.example .env`
1. Put correct creds there

## Development

To run development env

```
$ npm run dev 
```

Your actual code will be under build folder with same structure you have under src.

#### Flow

We use flow type system. Here you have an examples

**Simple types**

```flow js
const a: number = 1;
const b: number = 2;

function sum(c: number, d: number): number {
    return c + d;
}

sum(a + b);
```  

**Complex types**
```flow js
// objects
const o: {
    foo: number,
    bar: boolean,
    col: { foo: number }
} = { foo: 1, bar: true, col: { foo: 2 } };

// tuples
const tuple: [number, boolean, string] = [1, true, "three"];

// arrays
let arr1: Array<boolean> = [true, false, true];
let arr2: Array<string> = ["A", "B", "C"];
let arr3: Array<mixed> = [1, true, "three"];
// or
let arr1: boolean[] = [true, false, true];
let arr2: string[] = ["A", "B", "C"];
let arr3: mixed[] = [1, true, "three"];

// note that
let arr3: ?number[] = [null]; // will be false
let arr3: ?number[] = "pisya"; // will be true
// but
let arr3: (?number)[] = [null]; // will be true
```
