# A react app deployment tool

Easily deploy create-react-app apps via sftp.

It's possible to set up a basic react app using the amazing create-react-app, but moving from a local project to a deployed production application is not quite so simple. Typically, one must build the app for production, and then move the build directory over to the server. Fine for a once off, but for continuous development, it's a total pain.

This tool should make deployment easier. Deployment is as simple as running:

```
rup deploy production
```

## Setup

Install the tool globally to make the ```rup``` cli available:

```
npm i -g react-deploy-sftp
```

Create a react-up.json file as follows, somewhere in your project. This can be in your project root, but for safety, I like to put it in a ```/deploy``` directory that is .gitignored so I never accidentally send private access keys or passwords to public Git repos.

```

{
  "production":{
    "buildDir" :"../build",
    "remoteDir":"/var/www/myreactapp",
    "tarballName":"temp-deployment.tar",
    "host": "1.1.1.1",
    "port": 22,
    "username": "user",
    "password": "coolpassword"
  },
  "staging":{
    "buildDir" :"../build",
    "remoteDir":"/var/www/myreactapp",
    "tarballName":"temp-deployment.tar",
    "host": "1.1.1.1",
    "port": 22,
    "username": "user",
    "password": "coolpassword"
  },
  ...
}

```

Notes on the above example ```react-up.json``` file:

- "production" and "staging" correspond to the second command line argument when running ```rup```.
- You may have as many of these groups as you like, named whatever you like.
- "buildDir" is the location of the build relative to the current working directory.
- "remoteDir" is the location of the react app on the remote server.
- "tarballName" is the name of the temporary file created during deployment.
- "host" is the ip address of the server
- "port" is the port for ssh/sftp
- "username" is the username for ssh/sftp
- "password" is the password for ssh/sftp

## FAQ

### What's going on behind the scenes?

See ```cli.js```.

0. The build directory is rolled up in a tarball.
1. Remote project directory is removed
2. Remote project directory is recreated empty.
3. The tarball is sftp'd across to the remote server.
4. The tarball is dearchived.
5. The tarball is deleted.

### Why do I need to specify "deploy"?

In future I hope to implement other features such as ""init", "setup" and "teardown" etc.

### Why "rup"?

1. It's short and easy to type.
2. It's a nod to "mup" which stands for "meteor up", a deployment tool for meteor that is just wonderful. I'd be using that if I could...but it's overkill for a simple react app and relies on docker images, which bring way too much overhead in my opinion. Maybe this is overkill for a simple react app too...ah... who knows...I've built it now.

### Contributions?

Yes. Make a pull request, or report an issue on github. I'm also on twitter @aidanbreen if you want to discuss features, bugs or just give out.
