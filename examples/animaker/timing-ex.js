var tm = new TimingManager(timingData);

// Map actions to labeled animations
tm.register({
    Alpha: function(info) {
        console.log("Alpha has been called after %ss", info.start);
    },
    Delta: function(info) {
        console.log("Delta has been called, it starts at %ss and lasts for %ss",
                    info.start, info.durn);
    }
});

// Play the animations
tm.play();

// call frameApply after 40s
_.delay(tm.frameApply, 40*1000, 10);
