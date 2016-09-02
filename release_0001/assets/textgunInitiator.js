var live_path = 'https://b1host.blob.core.windows.net/bwin-feeds/20972.json';
var path = 'https://b1host.blob.core.windows.net/bwin-feeds/20973.json';
var backup_path = 'https://b1host.blob.core.windows.net/bwin-feeds/20004.json';

var events = [
    [848723, 'first']
];

var err = false;
var live_text = ''; //set dynamic
var last_update = ''; //set dynamic
var update_history = [];

window.addEventListener('load', function(){

    recieved_data = new dynamicFeedObject({
        path:path,
        livep:live_path,
        bkpp:backup_path,
        events:events
    });

    document.addEventListener('outputReady', function(){
        feed = recieved_data.output; // update to the right game
        update_history.push( feed.last_update );
        last_update = feed.last_update;
        live_text = feed.is_now_live != 'NotStarted' ? 'Live' : '';
        initiateMachineGun(feed, live_text);
    });

    document.addEventListener('feedUpdate', function(){
        feed = recieved_data.output;

        if( new Date(feed.last_update) > new Date(last_update) )
        {
            update_history.push( feed.last_update );
            last_update = feed.last_update;
            live_text = feed.is_now_live != 'NotStarted' ? 'Live' : '';

            weapon.stop();
            delete weapon;
            weapon = {};
            text.innerHTML = ''; //clear content

            initiateMachineGun(feed, live_text)
        }
    });

    document.addEventListener('noFeedError', function(){
        setTimeout(function(){
            if( err == false )
            {
                text.innerHTML = '<div style="opacity:1; font-size:24px; text-indent: 45px;" class="zoom-animation">Bis zu &#8364;50 Joker-Wette!</div>';
                err = true;
            }
        },1100);
    });

});

function initiateMachineGun(feed, live_text)
{
    weapon = {};
    weapon = new Machine_gun({
        global_string:'#{$step_one}{0.5} #Erst {0.5}#eine {0.5}#Wette {0.5}#macht #es {0.7}#zu {0.7}#Ihrem {0.5}#Spiel! #<small style="{$style}">{$live} Quote {$odds_team_1} auf einen<br />{$team_1}-Sieg</small>{$button} {0.8}',
        id:'text',
        vars:{
            team_1:feed.team_short_1,
            team_2:feed.team_short_2,
            odds_team_1:feed.odds_1,
            odds_team_x:feed.odds_x,
            odds_team_2:feed.odds_2,
            step_one:'<div class="first-frame"></div>',
            button:'<div class="cta">Jetzt Wetten!</div>',
            style:'font-size:17px',
            live:live_text
        },
        no_data:'',
        ms_per_letter:110, //miliseconds to show slide for each letter
        min_ms_per_show:100, //minimul number of milisecods to show the slider
        scroll_enable: false, //create slider
        scroll_id:'scroll', //id of scroll element
        scroll_count:0, //times the scroll will run ( set 0 for infinite )
        show_scroll_after:0, //after what run to show the scroll and stop ( 0 for last frame )
        scroll_end_stop:0, //position to stop after last run
        scroll_stop_delay: 2, //default delay until showing odds data
        back_time:500, //time for the backwords run at the end
        scroll_tranz:100, //tranzision between slides
        animation_type: 'blur-animation'
    },true,true);
}