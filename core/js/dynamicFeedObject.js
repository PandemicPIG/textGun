var dynamicFeedObject = function(data)
{
    //constructor
    this.dev = false;
    this.data = data;
    this.loadStage = 'live'; // live | main | bkup
    this.first = true;
    this.update = true; //upade every second if true
    this.feedData = false;
    this.game = false;
    this.noBackup = this.data.bkpp === '' ? true : false;

    if( this.data.livep === '' ) this.loadStage = 'main';
    if( this.data.path === '' && this.data.livep === '' ) this.loadStage = 'bkup';
    if( this.data.path === '' && this.data.livep === '' && this.data.bkpp === '' ) console.error('No feed was set. Please check your code!');

    this.structuredData = {games:[]};
    this.lastFeed = [];

    //events
    this.appStart = new Event('appStart');
    this.feedSelected = new Event('feedSelected');
    this.feedLoaded = new Event('feedLoaded');
    this.dataParsed = new Event('dataParsed');
    this.allEventsLoaded = new Event('allEventsLoaded');
    this.gameFound = new Event('gameFound');
    this.outputReady = new Event('outputReady');
    this.feedUpdate = new Event('feedUpdate');
    this.noFeedError = new Event('noFeedError');

    //debug calls
    if(this.dev === true)
    {
        this.now = Date.now();
        var _this = this;

        document.addEventListener('appStart', function(){
            console.info('started succesfuly!', 'time:', Date.now() - _this.now, 'miliseconds' );
        });

        document.addEventListener('feedSelected', function(){
            console.info('feed selected succesfuly!', 'time:', Date.now() - _this.now, 'miliseconds' );
        });

        document.addEventListener('feedLoaded', function(){
            console.info('feed loaded succesfuly!', 'time:', Date.now() - _this.now, 'miliseconds' );
        });

        document.addEventListener('dataParsed', function(){
            console.info('feed data parsed succesfuly!', 'time:', Date.now() - _this.now, 'miliseconds' );
        });

        document.addEventListener('allEventsLoaded', function(){
            console.info('all events loaded succesfuly!', 'time:', Date.now() - _this.now, 'miliseconds' );
        });

        document.addEventListener('gameFound', function(){
            console.info('game found succesfuly!', 'time:', Date.now() - _this.now, 'miliseconds' );
        });

        document.addEventListener('outputReady', function(){
            console.info('output set succesfuly!', 'time:', Date.now() - _this.now, 'miliseconds' );
        });

        document.addEventListener('feedUpdate', function(){
            console.info('update set succesfuly!', 'time:', Date.now() - _this.now, 'miliseconds' );
        });

        document.addEventListener('noFeedError', function(){
            console.warn('Failed miserably!', 'time:', Date.now() - _this.now, 'miliseconds' );
        });
    }

    this.origin();
    this.liveUpdate();
};

dynamicFeedObject.prototype.origin = function()
{
    //start
    var _this = this;
    document.dispatchEvent(this.appStart);

    this.init(this.loadStage);

    document.addEventListener('dataParsed', function(){
        _this.init(_this.loadStage);
    });

    document.addEventListener('feedLoaded', function(){
        if(_this.feedType == 'json-bann') _this.getFlowData();
        else if(_this.feedType == 'json-part') _this.getPartData();
    });

    document.addEventListener('allEventsLoaded', function(){
        _this.checkAllGames();
    });
};

dynamicFeedObject.prototype.init = function(state)
{
    //initiator loop
    var _this = this;

    if( this.dev === true ) console.log( 'load stage:', this.loadStage );

    if(state == 'live')
    {
        this.getFeedType(this.data.livep);
        this.loadStage = 'main';
    }
    else if(state == 'main')
    {
        this.getFeedType(this.data.path);
        this.loadStage = 'bkup';
    }
    else if(state == 'bkup')
    {
        this.getFeedType(this.data.bkpp, true);
        this.loadStage = 'end';
    }
    else if(state == 'end')
    {
        document.dispatchEvent(this.allEventsLoaded);
    }
};

dynamicFeedObject.prototype.getFeedType = function(path, bkp)
{
    //select feed type
    if(typeof bkp == 'undefined') bkp = false;
    if( this.dev === true ) console.log('this feed is for bkup:', bkp);

    if(path === '' || path == 'undefined')
    {
        console.warn('No path set for ' + this.loadStage + ' stage! Backup loaded instead.');
        this.fetchFeed(this.data.bkpp);
    }
    else{
        if(path.match(/.do\?/) !== null)
        {
            this.feedType = 'not-json-part';
            document.dispatchEvent(this.feedSelected);
            console.error ('app does not support partner feed!');
        }
        else if(path.match(/.php\?/) !== null)
        {
            this.feedType = 'json-part';
            document.dispatchEvent(this.feedSelected);
            this.fetchFeed(path, bkp); //call for the feed
            console.warn ('partner feed parsing through php will kill the server!');
        }
        else
        {
            this.feedType = 'json-bann';
            document.dispatchEvent(this.feedSelected);
            this.fetchFeed(path, bkp); //call for the feed
        }
    }
};

dynamicFeedObject.prototype.fetchFeed = function(path, bkp)
{
    //get bannerflow feed
    var _this = this;

    if( this.dev === true ) console.log('feed path:', path);

    if(typeof fetch != 'undefined')
    {
        var request = new Request( path, {
            method: 'GET',
            mode: 'cors',
            redirect: 'follow',
            headers: new Headers({
                'Content-Type': 'text/plain'
            }),
            cache: 'no-cache'
        });

        fetch(request).then(function(response){
            return response.json();
        }).then(function(raw_data){
            if( _this.dev === true ) console.log( 'feed (fetch):', raw_data );

            if( raw_data.BettingOffer["@markets"] > 0 )
            {
                _this.feedData = raw_data;
                if( bkp === true ) _this.bkpFeed = raw_data;
                document.dispatchEvent(_this.feedLoaded);
            }
            else
            {
                console.warn('Feed empty. Skipping feed...');
                document.dispatchEvent(_this.dataParsed);
            }
        }).catch(function(err){
            console.warn('ERR:404 Feed not found! Skipping feed...');
            if( _this.loadStage == 'end' ) _this.noBackup = true;
            document.dispatchEvent(_this.dataParsed);
        });
    }
    else
    {
        //fallback to clasic ajax call where fetch is not suported
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState === 4 && httpRequest.status === 200)
            {
                _this.feedData = JSON.parse(httpRequest.responseText);
                if( bkp === true ) _this.bkpFeed = _this.feedData;
                if( _this.dev === true ) console.log( 'feed (ajax):', _this.feedData );
                document.dispatchEvent(_this.feedLoaded);
            }
        };
        httpRequest.open('GET', path, true);
        httpRequest.send();
    }
};

dynamicFeedObject.prototype.getFlowData = function(feed)
{
    //get data from bannerflow feed
    if( this.feedData.BettingOffer["@markets"] > 0 )
    {
        var ev = typeof feed == 'undefined' ? this.feedData.BettingOffer.League : feed.BettingOffer.League;
        var len = (typeof ev.length == 'undefined') ? 1: ev.length;

        if( this.dev === true ) console.log( 'games in feed: ' + len );

        for ( var i = 0; i < len; i++ )
        {
            var event = (len == 1) ? ev.Event : ev[i].Event;

            var game = {
                last_update: this.feedData.BettingOffer['@updated'],
                id: event["@groupEventId"],
                is_set_live: event["@isLive"],
                link: event["@linkmobile_sb"],
                link_team_1: event.Market.Option[0]["@linkmobile"],
                link_team_2: event.Market.Option[2]["@linkmobile"],
                date: event["@date"],
                end_date: event["@cutOffDate"],
                id_team_1: event["@player1Id"],
                id_team_2: event["@player2Id"],
                team_1: event.Market.Option[0]["@name"],
                team_short_1: event.Market.Option[0]["@shortName"],
                team_2: event.Market.Option[2]["@name"],
                team_short_2: event.Market.Option[2]["@shortName"],
                odds_1: event.Market.Option[0]["@odds"],
                odds_x: event.Market.Option[1]["@odds"],
                odds_2: event.Market.Option[2]["@odds"],
                shirt_1: event.TeamShirts['@home'],
                shirt_2: event.TeamShirts['@away'],
                score: event.Score,
                is_now_live: typeof event.Score.ScoreBoard != 'undefined' ? event.Score.ScoreBoard['@state'] : 'NotStarted'
            };

            if( typeof feed != 'undefined' ) this.lastFeed.push(game);
            else this.structuredData.games.push(game);
        }

        if( this.dev === true ) console.log( 'feed data:', this.structuredData );

        if( typeof feed == 'undefined' ) document.dispatchEvent(this.dataParsed);
    }
    else document.dispatchEvent(this.dataParsed);
};

dynamicFeedObject.prototype.getPartData = function()
{
    //get data from partner feed
    console.error('Data structure not implemented!');
    /*
        !!! not implemented !!!
        !!!   plese avoid   !!!
        !!! don't implement !!!
    */
};

dynamicFeedObject.prototype.checkAllGames = function()
{
    //create object of games to chack
    if( this.data.events.length > 0 )
    {
        for( var i = 0; i < this.data.events.length; i++ )
        {
            if( this.dev === true ) console.log( 'game:', this.data.events[i][0], this.data.events[i][1] );
            this.game = this.gameHandler(this.data.events[i][0], this.data.events[i][1]);
            if( this.game !== false )
            {
                document.dispatchEvent(this.gameFound);
                this.getOutput(this.game);
                break;
            }
        }
    }

    if( this.game === false ) this.fallBack();
};

dynamicFeedObject.prototype.gameHandler = function(id, pos)
{
    //get and return data relevant to the game
    var my_game = this.findGame(id);
    if( my_game !== false )
    {
        //check for what team to show and sort shit out
        if( this.dev === true ) console.log('team to show:', pos);
        if( pos == 'second' )
        {
            return this.swapTeams(my_game);
        }
        else if( pos == 'best' )
        {
            if( my_game.odds_1 > my_game.odds_2 ) return this.swapTeams(my_game);
            else return my_game;
        }
        else if( pos == 'worst' )
        {
            if( my_game.odds_1 < my_game.odds_2 ) return this.swapTeams(my_game);
            else return my_game;
        }
        else
        {
            return my_game;
        }

        return my_game;
    }
    else return false;
};

dynamicFeedObject.prototype.swapTeams = function(my_game)
{
    var my_new_game = JSON.parse(JSON.stringify(my_game)); //clone object

    my_new_game.team_1 = my_game.team_2;
    my_new_game.team_2 = my_game.team_1;
    my_new_game.team_short_1 = my_game.team_short_2;
    my_new_game.team_short_2 = my_game.team_short_1;
    my_new_game.id_team_1 = my_game.id_team_2;
    my_new_game.id_team_2 = my_game.id_team_1;
    my_new_game.odds_1 = my_game.odds_2;
    my_new_game.odds_2 = my_game.odds_1;
    my_new_game.link_team_1 = my_game.link_team_2;
    my_new_game.link_team_2 = my_game.link_team_1;
    my_new_game.shirt_1 = my_game.shirt_2;
    my_new_game.shirt_2 = my_game.shirt_1;

    return my_new_game;
};

dynamicFeedObject.prototype.findGame = function(id)
{
    //find event in feed
    for( var i = 0; i < this.structuredData.games.length; i++ )
    {
        if( id == this.structuredData.games[i].id )
        {
            return this.structuredData.games[i];
        }
    }
    return false;
};

dynamicFeedObject.prototype.getOutput = function(game)
{
    //buit out the output
    if( this.dev === true ) console.log('output:', game);
    this.output = game;
    if( this.first === true )
    {
        document.dispatchEvent(this.outputReady);
        this.first = false;
    }
    else document.dispatchEvent(this.feedUpdate);
};

dynamicFeedObject.prototype.fallBack = function()
{
    //fallback handler
    console.warn( 'Fallback mechanism initiated! Please check the validity of this banner!');
    if( this.feedData != false )
    {
        console.log('prev:', this.feedData, this.noBackup);

        if( this.noBackup === false )
        {
            this.getFlowData(this.bkpFeed);
            if( this.dev === true ) console.log( 'getting first game of bkup feed:', this.lastFeed[0] );
            this.output = this.lastFeed[0];
        }
        else
        {
            this.output = this.structuredData.games[0];
            console.warn('No data in backup feed. Displaying first game available.');
        }

        document.dispatchEvent(this.outputReady);
    }
    else
    {
        this.feedError();
    }
};

dynamicFeedObject.prototype.liveUpdate = function()
{
    var _this = this;
    _this.liveHandler();

    //if( this.update ) setInterval(function(){
    //    _this.liveHandler();
    //},1000);
};

dynamicFeedObject.prototype.liveHandler = function()
{
    this.structuredData = {games:[]};
    this.init('live');
};

dynamicFeedObject.prototype.feedError = function()
{
    document.dispatchEvent(this.noFeedError);
    console.error('All feeds broken of missing!!!');
};
