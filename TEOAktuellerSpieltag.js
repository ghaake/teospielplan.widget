// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: quote-right;

const widgetSize = (config.widgetFamily ? config.widgetFamily : 'medium');

const names = {
    "herren_1": "1. Herren",
    "herren_2": "2. Herren",
    "herren_3": "3. Herren",
    "herren_4": "4. Herren",
    "damen_1": "1. Frauen",
    "damen_2": "2. Frauen",
    "damen_3": "3. Frauen",
    "damen_4": "4. Frauen",
    "jungen_a": "A-Jugend",
    "jungen_b": "B-Jugend",
    "jungen_c": "C-Jugend",
    "jungen_d": "D-Jugend",
    "jungen_e": "E-Jugend",
    "jungen_f": "F-Jugend",
    "maedel_a": "A-Mädel",
    "maedel_b": "B-Mädel",
    "maedel_c": "C-Mädel",
    "maedel_d": "D-Mädel",
    "maedel_e": "E-Mädel",
    "maedel_f": "F-Mädel",
    "minis": "Minis"
    
}

const defaults = {
    fontLight: Font.lightMonospacedSystemFont(12),        
    fontBlack: Font.blackMonospacedSystemFont(11),
    maxGames: widgetSize === "large" ? 16 : 5,
    refreshHours: 1,
    scriptName: "TEOAktuellerSpieltag",
    clubName: "Oberlübbe"
}
const isMedium = widgetSize === "medium";
const isLarge = widgetSize === "large";
const isSmall = widgetSize === "small";

const apiUrl = "https://api.eintracht-oberluebbe.de/teoGames.php";

const data = await getData( apiUrl);

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
    list.url = `scriptable:///run/${defaults.scriptName}`;

    
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
    
    console.log( data )
    let home = data.filter( elem => elem.heim );
    let away = data.filter( elem => !elem.heim );
    
    if( !isSmall )
    {
        createMediumLarge( list, home, away );   
    }
    else
    {    
        const text = list.addText("Kleine Widgets werden nicht unterstützt!");    
        text.font = Font.blackSystemFont(16)
    }
    
    createFooter(list);
    
    return list;
}

function createMediumLarge( list, home, away )
{
    if (widgetSize != 'small')
    {
        list.setPadding(20, 20, 20, 20);
    }
    
    let headerText = "";
    headerText += "Aktueller Spieltag TEO";
    let header = list.addText( headerText );
    header.font = Font.blackSystemFont(14);
    list.addSpacer(6);
    
    createSection(list, "Heimspiele", home)
    
    if( widgetSize !== "large" ) { return; }
    
    list.addSpacer(6)
    createSection(list, "Auswärtsspiele", away)
}

function createSection( list, title, games ) 
{
    let subheader1 = list.addText( title );
    subheader1.font = Font.blackSystemFont(10)
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
        if( isMedium && index > 4 ) { return; }
        let enemy;
        let location;
        let fontType = defaults.fontLight;
    
        let colId = 0;
    
        addEntry(bodyColumns[colId++], game.datum, fontType);    
        addEntry(bodyColumns[colId++], game.uhrzeit, fontType);
        addEntry(bodyColumns[colId++], names[game.mannschaft] || game.mannschaft, fontType);
        addEntry(bodyColumns[colId++], game.gegner, fontType);
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
    try{
        var temp = col.addText( text  );
        temp.font = font;
        col.addSpacer(1)
    }
    catch( error )
    {
        console.log( error )
    }
    
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