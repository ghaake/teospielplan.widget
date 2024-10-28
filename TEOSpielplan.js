// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: quote-right;

const widgetSize = (config.widgetFamily ? config.widgetFamily : 'large');

const defaults = {
    fontLight: Font.lightMonospacedSystemFont(12),        
    fontBlack: Font.blackMonospacedSystemFont(11),
    maxGames: widgetSize === "large" ? 16 : 5,
    history: widgetSize === "large" ? 40 : 21,
    refreshHours: 1,
    scriptName: "TEOSpielplan",
    clubName: "Oberlübbe"
}

const apiBase = "https://api.eintracht-oberluebbe.de/games.php?team=";
const apiURL = ( team ) => `${apiBase}${team}`;

let teamId = "herren_1";

if( !args.widgetParameter )
{
    if( args.queryParameters && args.queryParameters.t )
    {
        teamId = args.queryParameters.t + '';
    }
}
else
{
    teamId = args.widgetParameter + '';
}

const data = await getData( apiURL(teamId) );

const widget = await createWidget();

if (!config.runInWidget) {
  switch(widgetSize) {
    case 'small':
    await widget.presentSmall();
    break;

    case 'large':
    await widget.presentLarge();
    break;
    
    default:
    await widget.presentMedium();
  }
}

Script.setWidget( widget );
Script.complete();

function createWidget()
{
    const list = new ListWidget();
    const nextRefresh = Date.now() + (1000*60*60 * defaults.refreshHours);
    list.refreshAfterDate = new Date(nextRefresh);
    list.url = `scriptable:///run/${defaults.scriptName}/?t=${teamId}`;

    
    const bgColor = new LinearGradient();
    bgColor.colors = [new Color("#0038a8"), new Color("#3173f7")];
    bgColor.locations = [0.0, 1.0];
    list.backgroundGradient = bgColor;
    
    if( !data )
    {
        let header = list.addText( headerText );
        header.font = Font.blackSystemFont(16);
        list.addSpacer(10);
        let error = list.addText( "Fehler beim laden der Spieldaten. Überprüfen Sie ihre Internetverbindung." );    
        error.font = Font.italicSystemFont(12);
        return list
    }
    
    let games = data[0].dataList;
    const info = data[0].team;
    
    if( widgetSize !== "small" )
    {
        createMediumLarge(list, gamesSince( games, defaults.history ), info);   
    }
    else
    {
        createSmall(list, gamesSince( games, 0 ), info);
    }
    
    createFooter(list);
    
    return list;
}

function createSmall(list, games, info)
{
    let headerText = "";
    headerText += info.fullName;
    
    let header = list.addText( headerText );
    header.font = Font.blackSystemFont(16);
    let caption = list.addText( info.league );
    caption.font = Font.caption2();
    list.addSpacer();

    const body = list.addStack();
    body.layoutHorizontally();
    const bodyColumns = [];  
    bodyColumns[0] = body.addStack();
    body.addSpacer();
    bodyColumns[1] = body.addStack();

    bodyColumns[0].layoutVertically();
    bodyColumns[1].layoutVertically();

    games.forEach( ( game, index ) =>
    {
        if( index >= 4 ){ return; }
    
        let enemy;
        let fontType = defaults.fontLight;
        
        const time = generateTime( game );        
        if( game.gHomeTeam.includes( defaults.clubName ) )
        {
            enemy = game.gGuestTeam;
            fontType = defaults.fontBlack;
        }
        else 
        {
            enemy = game.gHomeTeam;
        }
    
        let colId = 0;
        addEntry(bodyColumns[colId++], game.gDate.substring( 0, 5 ), fontType);    
        addEntry(bodyColumns[colId++], enemy, fontType);
    });
}

function createMediumLarge(list, games, info)
{
    if (widgetSize != 'small')
    {
        list.setPadding(20, 20, 20, 20);
    }
    
    let headerText = "";
    headerText += "Spielplan ";
    headerText += info.fullName;
    
    let header = list.addText( headerText );
    header.font = Font.blackSystemFont(16);
    let caption = list.addText( info.league );
    caption.font = Font.caption2();
    list.addSpacer(10);
    
    const body = list.addStack();
    body.layoutHorizontally();

    const bodyColumns = [];  
    bodyColumns[0] = body.addStack();
    body.addSpacer(4);
    bodyColumns[1] = body.addStack();
    body.addSpacer(10);
    bodyColumns[2] = body.addStack();
    body.addSpacer(12);
    bodyColumns[3] = body.addStack();
    body.addSpacer();
    bodyColumns[4] = body.addStack();
    
    bodyColumns[0].layoutVertically();
    bodyColumns[1].layoutVertically();
    bodyColumns[2].layoutVertically();
    bodyColumns[3].layoutVertically();
    bodyColumns[4].layoutVertically();
    
    games.forEach( ( game, index ) =>
    {
        if( index >= defaults.maxGames ){ return; }
    
        let enemy;
        let location;
        let fontType = defaults.fontLight;
        
        const result = generateResult( game );
        const time = generateTime( game );
        
        if( game.gHomeTeam.includes( defaults.clubName ) )
        {
            enemy = game.gGuestTeam;
            location = "H";
            fontType = defaults.fontBlack;
        }
        else 
        {
            enemy = game.gHomeTeam;
            location = "A";
        }
    
        let colId = 0;
    
        addEntry(bodyColumns[colId++], game.gDate, fontType);    
        addEntry(bodyColumns[colId++], time, fontType);
        addEntry(bodyColumns[colId++], location, fontType);
        addEntry(bodyColumns[colId++], enemy, fontType);
        addEntry(bodyColumns[colId++], result, fontType);
    });
}

function createFooter(list)
{
    list.addSpacer();
    
    const socket = list.addStack();
    socket.layoutHorizontally();
        
    const socketLeft = socket.addStack();
    socketLeft.backgroundColor = new Color('#a0a0a0', .6);
    socketLeft.cornerRadius = 3;
    socketLeft.setPadding(2, 4, 2, 4)
    
    const socketAboutWidget = socketLeft.addText('eintracht-oberluebbe.de');
    socketAboutWidget.url = 'https://eintracht-oberluebbe.de';
    socketAboutWidget.font = Font.mediumSystemFont(8);
    socketAboutWidget.color = new Color('#efefef');
    
    if( widgetSize === "small" )
    {
        return;
    }

    socket.addSpacer();

    const socketRight = socket.addStack();
    socketRight.backgroundColor = new Color('#b0b0b0', .6);
    socketRight.cornerRadius = 3;
    socketRight.setPadding(2, 4, 2, 4);
    
    const socketAboutDataSource = socketRight.addText('Widget von Gerrit Haake');
    socketAboutDataSource.url = 'https://widgets.gerrithaake.de';
    socketAboutDataSource.font = Font.mediumSystemFont(8);
    socketAboutDataSource.color = new Color('#efefef');
    socketAboutDataSource.rightAlignText();
}

function addEntry( col, text, font )
{
    var temp = col.addText( text );
    temp.font = font;
    col.addSpacer(1)
}

function generateResult( game )
{
    let result = game.gHomeGoals !== " " ? game.gHomeGoals : "-";    
        result += ":";
        result += game.gGuestGoals !== " " ? game.gGuestGoals : "-";        
    return result;
}

function generateTime( game ) 
{
    return game.gTime !== "" ? game.gTime : "--:--";
}

async function getData( url )
{
    let data;
    try
    {
        data = new Request(url).loadJSON();
    }
    catch (e)
    {
        return false;
    }

    return data;
}

function gamesSince( games, days )
{
    const d = days * 24 * 60 * 60 * 1000
    gamesFiltered = games.filter( elem => {
        let date = elem.gDate.split(".");
        date = date[1] + "/" + date[0] + "/" + date[2];    
        date = Date.parse(date);
        return date >= Date.now() - d
    });
    
    return gamesFiltered;
}