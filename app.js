process.chdir(__dirname);
const package_info = require("./package.json");
var software = package_info.name + " (V " + package_info.version + ")";
console.log(software);
console.log("=".repeat(software.length));

const fs = require("fs");
var envpath = __dirname + "/.env";
var config = require("dotenv").config({ path: envpath });
var config_example = "";
if (fs.existsSync(".env")) {
  for (var attributename in config.parsed) {
    config_example += attributename + "=\r\n";
  }
  fs.writeFileSync(".env.example", config_example);
}

const tc = require("tinder-client");
const queue = require("better-queue");
const exec = require("child_process").execSync;

var q = new queue(
  function(input, cb) {
    input(cb);
  },
  { afterProcessDelay: 1000 * 60 }
);

var dif = 0;
var profile = {};
try {
  profile = require("./tmp/_Profile.json");
} catch (e) {}
var meta = {};
try {
  meta = require("./tmp/_Meta.json");
} catch (e) {}

async function main() {
  console.log("Main Start");
  try {
    const client = await tc.createClientFromFacebookLogin({
      emailAddress: process.env.FACEBOOK_LOGIN,
      password: process.env.FACEBOOK_PASS
    });
    console.log(client);
    q.push(cb => {
      set_location(client, cb);
    });
  } catch (e) {
    console.error(e);
    q.push(cb => {
      NeustartUndSo();
    });
  }
}
main();

function NeustartUndSo(Zeit = 1) {
  console.log(new Date(), "Restart in " + Zeit + " Min!");
  setTimeout(() => {
    dif = 0;
    main();
  }, 1000 * 60 * Zeit);
}

async function set_location(client, cb) {
  console.log("Update Profile Start");
  save_file("Client", client, true);
  profile = await client.getProfile();
  var my_year = new Date().getFullYear();
  var my_birthday = new Date(profile.birth_date).getFullYear();
  var min_age = my_year - my_birthday - 8;
  var max_age = my_year - my_birthday + 5;
  await client.changeLocation({
    latitude: process.env.POS_latitude,
    longitude: process.env.POS_longitude
  });

  if (dif >= 100) {
    dif = 100;
    await client.updateProfile({
      userGender: 0,
      searchPreferences: {
        minimumAge: min_age,
        maximumAge: max_age,
        genderPreference: 1,
        maximumRangeInKilometers: dif
      }
    });
  } else {
    await client.updateProfile({
      userGender: 0,
      searchPreferences: {
        minimumAge: min_age,
        maximumAge: max_age,
        genderPreference: 1,
        maximumRangeInKilometers: 1 + dif
      }
    });
  }

  profile = await client.getProfile();
  await save_file("_Profile", profile);
  meta = await client.getMetadata();
  await save_file("_Meta", meta);
  console.log("Update Profile End");

  if (meta.rating.likes_remaining > 0) {
    if (dif >= 100) {
      dif = 0;
      q.push(cb => {
        set_location(client, cb);
      });
    }
    q.push(cb => {
      set_likes(client, cb);
    });
  } else {
    dif = 100;
    var d = new Date(meta.rating.rate_limited_until) - new Date() + 1000;
    console.log(new Date(meta.rating.rate_limited_until));
    NeustartUndSo(parseInt(d / 1000 / 60));
    q.push(cb => {
      set_location(client, cb);
    });
  }
  cb();
}

async function set_next(client, cb) {
  console.log("Send Likes - Next");
  dif++;
  q.push(cb => {
    set_location(client, cb);
  });
  q.push(cb => {
    set_likes(client, cb);
  });
  cb();
}

async function set_likes(client, cb) {
  console.log("Send Likes Start");
  var resp = {};
  resp.likes_remaining = 1;
  while (resp.likes_remaining > 0) {
    const recommendations = await client.getRecommendations();
    if (typeof recommendations == "undefined") {
      q.push(cb => {
        set_next(client, cb);
      });
      cb();
      return;
    }
    if (typeof recommendations.results == "undefined") {
      q.push(cb => {
        set_next(client, cb);
      });
      cb();
      return;
    }
    if (typeof recommendations.results.length == "undefined") {
      q.push(cb => {
        set_next(client, cb);
      });
      cb();
      return;
    }
    console.log("Like Recommendations:", recommendations.results.length);

    for (var i = 0; i < recommendations.results.length; i++) {
      var perso = recommendations.results[i];
      var is_new = await save_file("P_" + perso._id, perso, true);

      if (1) {
        resp = await client.like(perso._id);
        console.log("Like: ", perso.name);

        if (resp.likes_remaining == 0) {
          remove_file("P_" + perso._id);
          break;
        } else {
          save = true;
        }
      } else {
        console.error("Already: ", perso.name);
        q.push(cb => {
          set_next(client, cb);
        });
        q.push(cb => {
          set_likes(client, cb);
        });
      }
    }
  }

  var d = new Date(resp.rate_limited_until) - new Date() + 1000;
  if (d > 0) {
    q.push(cb => {
      set_next(client, cb);
    });

    console.log("Break Until" + new Date(resp.rate_limited_until) + ":" + d + "Sec");
    if (save == true) {
      try {
        console.log("Send Likes Ende");
        exec("git add .");
        exec('git commit -m "Tinder Update"');
        save = false;
      } catch (e) {
        console.error(e);
      }
    }
  } else {
    q.push(cb => {
      set_likes(client, cb);
    });
  }
  console.log("Send Likes Ende");
  cb();
}

async function save_file(name, data, only_new = false) {
  try {
    var filename = "./tmp/" + name + ".json";
    var fs = require("fs");
    if (fs.existsSync(filename)) {
      if (only_new) {
        return false;
      }
      fs.unlinkSync(filename);
    }
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
async function remove_file(name) {
  try {
    var filename = "./tmp/" + name + ".json";
    var fs = require("fs");
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
    }
  } catch (e) {
    console.error(e);
  }
}
