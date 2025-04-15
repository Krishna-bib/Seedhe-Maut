let songs = [];
let currFolder;

async function getsongs(folder) {
    currFolder = folder;
    

    try {
        let a = await fetch(`./songs/${folder}/info.json`);
        let response = await a.json();

        songs = response.songs; 

        let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
        songul.innerHTML = ""; 

        
        for (const song of songs) {
            songul.innerHTML += `<li>
          
                    <div>${song.title}</div>  <!-- Display song title -->
                </div>
                <div class="playnow">
                    <img src="img/play.svg" alt="" class="invert">
                </div>
            </li>`;
        }

      
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e, index) => {
            e.addEventListener("click", function () {
                playmusic(index);  
            });
        });
    } catch (error) {
        console.error("Error loading songs:", error);
     
        document.querySelector(".songlist").getElementsByTagName("ul")[0].innerHTML = 
            `<li>Failed to load songs. Please try another album.</li>`;
    }
}

let currsong = new Audio();
let currentIndex = 0;

const playmusic = (index, pause = false) => {
    if (songs.length === 0 || index >= songs.length) {
        console.error("No songs available or invalid index");
        return;
    }
    
    currentIndex = index;  
    const track = songs[index]; 
    
    currsong.src = track.url;   
    
    if (!pause) {
        currsong.play()
            .then(() => {
                play.src = "img/pause.svg";  // Change the play button to pause
            })
            .catch(err => {
                console.error("Error playing song:", err);
                play.src = "img/play.svg";
            });
    }

    document.querySelector(".songinfo .actual").innerText = track.title;
    document.querySelector(".songtime").innerHTML = "00:00";  
};

async function main() {
    try {
      
        await getsongs("Na");
        if (songs.length > 0) {
            playmusic(0, true);
        }
        
      
        play.addEventListener("click", () => {
            if (currsong.paused) {
                currsong.play()
                    .then(() => play.src = "img/pause.svg")
                    .catch(err => console.error("Error playing:", err));
            }
            else {
                currsong.pause();
                play.src = "img/play.svg";
            }
        });
        
        // Format time (mm:ss)
        function formatTime(seconds) {
            if (isNaN(seconds) || seconds === Infinity) return "00:00";
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        // Update time and seekbar
        currsong.addEventListener("timeupdate", () => {
            document.querySelector(".songtime").innerHTML = `${formatTime(currsong.currentTime)}/${formatTime(currsong.duration)}`;
            const percent = (currsong.currentTime / currsong.duration) * 100 || 0;
            document.querySelector(".circle").style.left = percent + "%";
        });
        
        // Seekbar click
        document.querySelector(".seekbar").addEventListener("click", (e) => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width * 100);
            document.querySelector(".circle").style.left = percent + "%";
            currsong.currentTime = (currsong.duration * percent / 100) || 0;
        });

        // Hamburger menu
        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = "0";
        });

        // Close menu
        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-120%";
        });

        // Previous button
        previous.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + songs.length) % songs.length;
            playmusic(currentIndex);
        });
        
        // Next button
        next.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % songs.length;
            playmusic(currentIndex);
        });
        
        // Auto-play next song when current song ends
        currsong.addEventListener("ended", () => {
            currentIndex = (currentIndex + 1) % songs.length;
            playmusic(currentIndex);
        });
        
        // Volume control
        const volumeBar = document.getElementById("volumeBar");
        let volumeimg = document.querySelector(".volume-control img");

        // Initialize volume to slider value
        currsong.volume = volumeBar.value;
        
        volumeBar.addEventListener("input", () => {
            currsong.volume = volumeBar.value;
            volumeimg.src = currsong.volume > 0 ? "img/volume.svg" : "img/mute.svg";
        });
        
        // Mute/unmute
        volumeimg.addEventListener("click", () => {
            if (currsong.volume > 0) {
                currsong.volume = 0.0;
                volumeimg.src = "img/mute.svg";
                volumeBar.value = 0.0;
            }
            else {
                currsong.volume = 0.5; // Default to 50% volume when unmuting
                volumeimg.src = "img/volume.svg";
                volumeBar.value = 0.5;
            }
        });

        // Album/playlist cards click handler
        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async () => {
                const folder = card.dataset.floder;
                if (folder) {
                    try {
                        await getsongs(folder);
                        if (songs.length > 0) {
                            playmusic(0);
                        }
                    } catch (error) {
                        console.error("Error loading folder:", error);
                    }
                }
            });
        });
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

// Start the application
main();