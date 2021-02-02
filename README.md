# IPFS Private API

This repository contains the source code for a simple web application that manages access to a local
IPFS node, which includes creating and controlling private API keys through the app.

I'm not personally proud of the result.

# Written Questions

1) How would you improve this assignment for a production-ready solution (e.g., security, deployment)?

Although, this solution relies only on `RocksDB` for storage and retrieval of data (both metrics &
application) I would personally not use the same stack for a production-ready app.

Depending on where and how we want to deploy this software, I give a different answer, if we were
to use a serverless platform (i.e. AWS Lambda), I would suggest we used `DynamoDB` for storing
the application data, and `Amazon Timestream` for querying the metrics.

But if we wanted to deploy the application on a dedicated machine such as EC2, I would recommend
using `MongoDB` along with an LFU cache for the data, and we would then use `FluxDB` for storing the
metrics.

Another issue I would take into consideration was the security of the API keys. Currently, the
concepts of `API Key Identifier` and the `API Key` itself are not separated.
It is *not* safe. The `API Key` must never be stored anywhere, and we should display it to the user
once which is when they create their key.

So how can we achieve that? We can rely on JWT for this purpose. It additionally allows us to allow/block API endpoints per API Key.

And the IPFS node must be executed on an EC2 instance. But that's not scalable. We could set up several EC2 instances and use a load balancer in place of the current proxy. I suppose we then had to implement some form of technique to know which node should be used for each API-Key as that matters for `/pin/*` and possibly other commands.

2) Describe IPFS and compare it to other protocols e.g., HTTP?

> TLDR; Scroll to the last 2 paragraphs.

Imagine the society, throughout history, each culture has developed a set of rules (grammar) and vocabulary and the people in that culture have accepted to follow the rules of the language so that they can communicate with one another. And of course we have not just one but several hundred languages in the world and there are people who are fluent in more than one.

Now think about a network of interconnected machines, like the internet, if we wanted the computers communicate with one another, we also had to invent a kind of language. A set of rules that these machines could follow in order to transfer semantic information.

Each software forms a culture as large as the number of machines that are running that software, and one of the most widely used softwares is a web-browser. HTML is the language that was agreed upon to be used as the language for the web.

But where does the HTTP stand in all of this? Back to our example using natural language, the language itself is concept, it is invisible unless there is a way to transfer the data, two of the most common tools humans use to transfer a peace of information represented in a natural language are: Speaking and Writing, of course speaking uses sound and writing can use several elements including but not limited to pen&paper, stone, etc.
> A protocol is a contract between several parties in which they agree to uphold a set of rules defined by a specification.



The HTTP is like the process of speaking and TCP is the sound.

If we were to look at some of the earlier versions of the HTTP protocol, it was really simple, there was a server, and a client, the client would send a request stating some information such as the path they want to access and provide a set of headers and then the server would send a response. (Which was usually an HTML document.)


Afterward, the HTTP improved, HTTP 1.1 allowed a client to perform several request in one connection, it also introduced `keep-alive` & `upgrade` that laid the foundation for SSE (Server Sent Events) and WebSocket. It was revolutionary, now we had bi-directional real-time communication for the client & server.
Now that the world had solved the real-time communication problem for client-server connections on the web. It was time for P2P (client-client) communication. It was then that WebRTC was introduced.



Now, let’s talk about IPFS. First we need to understand that IPFS is a protocol, not a software. There are currently two official implementations that use that protocol, Go-IPFS & JS-IPFS. The specification can be found [here](https://github.com/ipfs/specs).



We found the first similarity between IPFS & HTTP, they’re both a protocol which can be used by machines on the network to transfer information.



Where HTTP only uses TCP, IPFS can use both TCP & UDP.

HTTP is a centralized protocol, it has the concept of server & client whereas IPFS is decentralized which means connections are P2P.

IPFS is content addressed which means where you can find a resource on the network is determined by computing the hash of the data initially.

# Build & Deployment

Make sure you have [Rust](https://www.rust-lang.org/tools/install) installed on your system.

```shell
cd frontend
yarn && yarn build

cd ../server
yarn
yarn build
yarn start
```

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
[move the data around](https://github.com/xoreaxeaxeax/movfuscator)? Wouldn't that be better if
that data was structured more elegantly?

# Authentication

Currently, anyone can create an account and use the system.
