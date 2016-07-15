var player;
var playerPorgress;
var playerProgressControl = document.getElementById("youtube-progress");

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '320',
        width: '480',
        // videoId: 'TGx0rApSk6w',
        playerVars: {
            'autoplay': 0,
            'controls': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
                //'onError': onPlayerError
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    // var playerTotalTime = player.getDuration();
    // playerProgressControl.max = playerTotalTime;
    // playerProgressControl.MaterialSlider.change();
}


function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        var playerTotalTime = player.getDuration();
        playerProgressControl.max = playerTotalTime;
        playerProgressControl.MaterialSlider.change();

        whichControlActive("play");
        playerPorgress = setInterval(function() {
            var playerCurrentTime = player.getCurrentTime();
            playerProgressControl.MaterialSlider.change(playerCurrentTime);
        }, 10)
    }

    if (event.data == YT.PlayerState.ENDED) {
        window.clearInterval(playerPorgress);
        playerProgressControl.MaterialSlider.change(0);

        if ($("#youtube-video-repeat").hasClass("mdl-button--colored")) {
            player.playVideo();
        } else {
            var next = findNextSong();
            player.loadVideoById(next.prop("data-id"));
            next.siblings().removeClass("active");
            next.addClass("active");
            // whichControlActive("stop");
        }
    }
}

Sortable.create(document.getElementById("youtube-list"));

var songList;
if (!localStorage.song) {
    songList = [];
    localStorage.setItem("song", '[]');
} else {
    songList = JSON.parse(localStorage.song);
    songList.forEach(function(song, index) {
        $("#youtube-list").append(createSongList(song[0], song[1], index, song[2]));
    });
}


$("#youtube-progress").on("input", function() {
    player.seekTo(this.value);
    window.clearInterval(playerPorgress);
});

$("#youtube-progress").on("change", function() {
    player.seekTo(this.value);
    window.clearInterval(playerPorgress);
});

$("#youtube-video-switch").on("click", function() {
    var icon = $(this).children(":first");
    if (icon.text() === "videocam") {
        icon.text("videocam_off");
        $("#youtube-player").css("width", 0);
        // $("#youtube-player").css("height", 0);
    } else {
        icon.text("videocam");
        $("#youtube-player").css("width", 480);
        // $("#youtube-player").css("height", 320);
    }
});

["play", "pause", "stop"].forEach(function(control) {
    $("#youtube-video-" + control).click(function() {
        player[control + "Video"]();
        whichControlActive(control);
    });
});

$("#youtube-video-repeat").on("click", function() {
    $(this).toggleClass("mdl-button--colored");
});

$("#youtube-list-add").on("click", function(e) {
    e.preventDefault();
    var name = $("#song-name").val();
    var url = $("#song-url").val().replace("https://www.youtube.com/watch?v=", "");

    if (name !== "" && url !== "") {
        $("#youtube-list").append(createSongList(name, url, $("#youtube-list-area li").length));
        songList.push([name, url, "p" + new Date().getTime()]);
        localStorage.song = JSON.stringify(songList);

        $("#youtube-list-add-success").show().animate({
            opacity: "toggle"
        }, 500);
        componentHandler.upgradeDom();
    } else {
        alert("請填入youtube連結&自訂名稱");
    }
});

$("#youtube-list").on("click", function(e) {
    var target = $(e.target);
    if (target.hasClass("mdl-list__item-primary-content") || target.hasClass("mdl-list__item")) {
        var li = target.hasClass("mdl-list__item-primary-content") ? target.parent() : target;
        player.loadVideoById(li.prop("data-id"));
        li.siblings().removeClass("active");
        li.addClass("active");
    }

    if (target.hasClass("song-remove")) {
        var pid = target.prop("id").replace("song-remove-", "");
        var li = $("#" + pid);
            li.remove();
            var removeTarget;
                if (song[2] === pid) {
                    removeTarget = index;
                }
            });
            songList.splice(removeTarget, 1);
            localStorage.song = JSON.stringify(songList);
            alert("播放中的歌曲，無法刪除");
        }
    }
});

function whichControlActive(control) {
    $("#youtube-controls button").removeClass("mdl-button--accent");
    $("#youtube-video-" + control).addClass("mdl-button--accent");
}

function findNextSong() {
    var length = $("#youtube-list li").length;
    var now = $("#youtube-list li.active").index();
    var next;
    for (var i = now; i < length; i++) {
        var li = $("#youtube-list li").eq(i);
        if ($("input", li).prop("checked") && i !== now) {
            next = li;
            break;
        }
    }
    if (!next) {
        next = $("#youtube-list li").eq(0);
    }
    return next;
}

function createSongList(name, url, index, pid) {
    var span = $("<span/>");
    span.addClass("mdl-list__item-primary-content");
    span.text(name);

    var switcher = $("<span/>");
    switcher.addClass("mdl-list__item-secondary-action");
    switcher.append($('<label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="list-switch-' + index +
        '"><input type="checkbox" id="list-switch-' + index + '" class="mdl-switch__input" checked /></label>'));

    var li = $("<li/>");
    li.prop("id", pid);
    li.addClass("mdl-list__item");
    li.prop("data-id", url);
    li.append(span);
    li.append('<i id="song-remove-' + pid + '" class="material-icons song-remove">backspace</i>' +
        '<div class="mdl-tooltip mdl-tooltip--left" for="song-remove-' + pid + '">刪除歌曲</div>');
    li.append(switcher);
    return li;
}