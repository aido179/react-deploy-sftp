#!/usr/bin/env node
var tar = require('tar-fs')
var fs = require('fs')
var Client = require('ssh2').Client;


if(process.argv[2] === "deploy"){

  //Read project settings from the current working directory
  let projectSettings;
  try{
    projectSettings = require(process.cwd()+'/react-up.json');
  }catch(error){
    if(error.message === "Cannot find module './react-up.json'"){
      console.log("\x1b[31mA react-up.json file has not been found.\x1b[0m");
      process.exit();
    }else{
      throw error;
    }
  }
  //Use the 3rd command line argument to select the environment and use those settings.
  environmentSettings = projectSettings[process.argv[3]];

  //Load project settings.
  const localDir = environmentSettings.buildDir || "./build"
  const remoteDir = environmentSettings.remoteDir || "/var/www/reactApp"
  const tarballName = environmentSettings.tarballName || "temp-deployment.tar"
  //Define commands to be run on the remote machine.
  const cleanCommand = `rm -rf ${remoteDir}`
  const tarcommand = `cd ${remoteDir} && tar -xf ${tarballName}`

  // Populate optional ownership configuration
  chown_config = {}
  if (environmentSettings.remoteDirOwner) {
    chown_config['owner'] = environmentSettings.remoteDirOwner
  }
  if (environmentSettings.bork) {
    chown_config['group'] = environmentSettings.remoteDirGroup
  }

  //Create a tarball of the build directory
  tar.pack(localDir).pipe(fs.createWriteStream(tarballName));


  //Do SFTP transfer
  var conn = new Client();
  conn.on('ready', function() {
    console.log('Deployment :: SFTP connection ready');
    conn.sftp(function(err, sftp) {
      if (err) throw err;
      //
      //1. Remove the project dir if it exists.
      //
      console.log("Deployment :: setting up...");
      conn.exec(cleanCommand, function(err, stream) {
        if (err) throw err;
        stream.on('close', function(code, signal) {
          //
          //2. Re-create the project dir
          //
          sftp.mkdir(remoteDir, chown_config ,function(err){
            if (err) throw err;
            console.log("Deployment :: set up");
            //
            //3. Move tar to remote
            //
            console.log("Deployment :: pushing...");
            sftp.fastPut(tarballName, remoteDir+"/"+tarballName, chown_config, function(err){
              if (err) throw err;
              //
              //4. Dearchive on remote
              //
              console.log("Deployment :: push complete");
              console.log("Deployment :: dearchiving...");
              conn.exec(tarcommand, function(err, stream) {
                if (err) throw err;
                stream.on('close', function(code, signal) {
                  console.log("Deployment :: dearchived");
                  //
                  //5. Delete tarball
                  //
                  console.log("Deployment :: cleaning up...");
                  sftp.rmdir(remoteDir+"/"+tarballName, function(){
                    if (err) throw err;
                    console.log("Deployment :: cleaned up");
                    conn.end();
                  });
                }).on('data', function(data) {
                  console.log('STDOUT: ' + data);
                }).stderr.on('data', function(data) {
                  console.log('STDERR: ' + data);
                });
              });
            })
          });
        }).on('data', function(data) {
          console.log('STDOUT: ' + data);
        }).stderr.on('data', function(data) {
          console.log('STDERR: ' + data);
        });
      });
    });
  }).connect({
    host: environmentSettings.host,
    port: environmentSettings.port,
    username: environmentSettings.username,
    password: environmentSettings.password
  });
}else{
  console.log("\x1b[31mCommand not found. Did you mean >rup deploy ...?\x1b[0m");
}
