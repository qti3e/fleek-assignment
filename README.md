# IPFS Private API

This repository contains the source code for a simple web application that manages access to a local
IPFS node, which includes creating and controlling private API keys through the app.

# Design Choices

The intend of this implementation is not limited to just getting the job done. I consciously
decided to do it the hard way and showcase my proficiency with different languages and frameworks.
So instead of relying on a mainstream database system (such as MongoDB or MySQL.) I preferred to
use `RocksDB` and also add a bit of `rust` to the equation.

As per the assignment, I used React for the frontend interface but took the liberty to rely on
`TypeScript` instead of plain JS. I have developed a sense of admiration for statically typed
languages over the years. I would say that TypeScript is a fair trade-off. In exchange for a few
more key-strokes, you get the type checker to provide some stunning safety guarantees. You also
help your IDE to provide better suggestions to you in the future. I call this phenomenal
helping-the-compiler-to-help-you.

Some people will open the argument that developing software in TypeScript takes more time. And I
admit that they are right. TypeScript, like, most other statically typed languages, tightens up the
developer's hand by introducing limitations. These limitations force the developer to think deeper
and come up with more profound data models. What does the software do but
[move the data around](https://github.com/xoreaxeaxeax/movfuscator)?

# Authentication

Currently, anyone can create an account and use the system. The first user who signs up will be
given the admin privileges.

# Build & Deployment

To be written.
