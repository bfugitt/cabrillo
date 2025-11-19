// game.js (FINAL REVISED VERSION)

// --- CORE GAME DATA (THE EDUCATIONAL CONTENT) ---
// Note: Keeping this in game.js for simplicity and easy editing by the teacher.
const eventData = [
    {
        location_name: "San Diego Bay (Initial Contact)",
        x: 380, y: 650, 
        logbook_text: "We entered a port and named it San Miguel. The land is excellent, and we saw signs of people. Morale is high, but we need supplies.",
        question: "Do you approach the local Kumeyaay people to trade for vital supplies, or cautiously sail past?",
        choices: [
            { text: "Trade Fairly, offering goods in exchange for water and fresh food.", supplies_change: 10, morale_change: 15, feedback: "Respectful trade built trust and secured more resources. Morale UP." },
            { text: "Sail Past, avoiding contact to save time and prevent possible conflict.", supplies_change: 0, morale_change: -10, feedback: "The crew worried about resources and lost confidence in leadership. Morale DOWN." }
        ],
        triggered: false
    },
    {
        location_name: "Santa Catalina Island (Injury)",
        x: 250, y: 400,
        logbook_text: "The seas are rough. We anchored near an island where the people came out in many canoes and were friendly. A native person was injured nearby.",
        question: "Do you spend valuable time and medical supplies to treat the injured person?",
        choices: [
            { text: "Provide Care, using limited medical supplies to aid the injured person (SEL).", supplies_change: -8, morale_change: 20, feedback: "Showing mercy is a virtue, and the local people offered guidance. Morale HIGH." },
            { text: "Ignore and Continue, rationing supplies and time for the journey north.", supplies_change: 0, morale_change: -15, feedback: "The crew felt the action was unchristian and lost respect for the mission. Morale LOW." }
        ],
        triggered: false
    },
    // --- NEW EVENT 1: Political/Indigenous Relations ---
    {
        location_name: "San Pedro Bay (Inter-Tribal Conflict)",
        x: 320, y: 500,
        logbook_text: "We encountered two different groups of indigenous people who appear to be in conflict over fishing territory near the bay.",
        question: "How do you respond to the conflict to secure safe passage?",
        choices: [
            { text: "Attempt to mediate a peaceful meeting between the two tribal leaders.", supplies_change: -5, morale_change: 10, feedback: "Diplomacy succeeded, securing safe passage and boosting crew morale." },
            { text: "Avoid the area entirely and sail far offshore to prevent becoming involved.", supplies_change: 0, morale_change: -5, feedback: "Safety was ensured, but the crew resented wasting time and fuel." }
        ],
        triggered: false
    },
    // --- NEW EVENT 2: Geographical/Supply Challenge ---
    {
        location_name: "Monterey Bay (Fog and Shallow Water)",
        x: 180, y: 150,
        logbook_text: "The sea has become shrouded in dense fog, and the coastline is treacherous with shallow sandbars that could beach the vessel.",
        question: "Navigation is nearly impossible. Do you anchor and wait, or risk pushing through the fog?",
        choices: [
            { text: "Anchor Immediately and wait for the fog to clear (Safety First).", supplies_change: -15, morale_change: 15, feedback: "Patience prevented disaster, but waiting consumed valuable supplies. Morale UP." },
            { text: "Risk pushing through the fog at high speed (Time is Critical).", supplies_change: -5, morale_change: -10, feedback: "The danger was palpable; the ship nearly ran aground, severely damaging morale." }
        ],
        triggered: false
    },
    // --- NEW EVENT 3: Storm/Structural Damage ---
    {
        location_name: "Point Conception (Major Storm Hazard)",
        x: 150, y: 250,
        logbook_text: "We encountered a storm so violent we thought we would perish. The wind tore the sails and the hull sustained significant damage.",
        question: "Structural damage must be addressed immediately. How do you allocate resources?",
        choices: [
            { text: "Use vital repair materials to reinforce the damaged hull (Prioritize Structure).", supplies_change: -25, morale_change: 0, feedback: "The ship is safe, but supplies are critically low. Supplies DOWN." },
            { text: "Only perform minimal repairs and ration food to save materials (Prioritize Food).", supplies_change: -10, morale_change: -20, feedback: "The crew feels unsafe in the un-repaired ship, causing morale to plummet. Morale LOW." }
        ],
        triggered: false
    }
];

// --- INTRO SCENE ---
class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    create() {
        const width = 700;
        const height = 750;

        // Greyscale background
        this.add.graphics().fillStyle(0x000000, 1).fillRect(0, 0, width, height);

        // Retro Mac Window for Intro Text
        const panelW = 500;
        const panelH = 600;
        
        let graphics = this.add.graphics();
        graphics.fillStyle(0xFFFFFF, 1); 
        graphics.lineStyle(3, 0x000000, 1);
        graphics.fillRect(width/2 - panelW/2, height/2 - panelH/2, panelW, panelH);
        graphics.strokeRect(width/2 - panelW/2, height/2 - panelH/2, panelW, panelH);

        graphics.fillStyle(0xCCCCCC, 1); 
        graphics.fillRect(width/2 - panelW/2 + 1, height/2 - panelH/2 + 1, panelW - 2, 25);
        
        const textStyle = { 
            fontSize: 16, 
            fill: '#000000', 
            fontFamily: 'Courier New, monospace', 
            wordWrap: { width: panelW - 40 }
        };

        this.add.text(width/2, height/2 - panelH/2 + 5, ' CABRILLO\'S VOYAGE (1542) ', 
            { fontSize: 18, fill: '#000000', fontFamily: 'Courier New, monospace', fontStyle: 'bold' })
            .setOrigin(0.5);

        const introText = 
            "MISSION: Navigate the coast of California, discover new ports, and maintain the honor and supplies of your crew.\n\n" +
            "BACKGROUND: You are Juan Rodríguez Cabrillo, leading a Spanish expedition. Your journey requires navigation, resource management, and ethical decisions regarding indigenous people.\n\n" +
            "CONTROLS:\n" +
            "  ⬆️ UP Arrow: Accelerate forward.\n" +
            "  ⬅️ ➡️ LEFT/RIGHT Arrows: Turn your ship.\n\n" +
            "RESOURCES:\n" +
            "  🍎 Supplies: Decreases over time and rapidly during storms. Must remain above 0.\n" +
            "  👍 Morale: Affected by decisions. Low morale causes faster resource loss.\n\n" +
            "OBJECTIVE: Reach the top of the map after triggering all anchor points (⚓) before supplies run out."
            
        this.add.text(width/2 - panelW/2 + 20, height/2 - panelH/2 + 40, introText, textStyle);
            
        // Start Button
        const startButton = this.add.text(width/2, height - 100, '[ CLICK TO START VOYAGE ]', { 
            fontSize: 20, 
            fill: '#000000', 
            backgroundColor: '#CCCCCC',
            padding: { x: 10, y: 5 },
            fontFamily: 'Courier New, monospace'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startButton.on('pointerdown', () => {
            this.scene.start('NavigatorScene');
        });
        
        startButton.on('pointerover', () => startButton.setBackgroundColor('#000000').setFill('#FFFFFF'));
        startButton.on('pointerout', () => startButton.setBackgroundColor('#CCCCCC').setFill('#000000'));
    }
}


// --- NAVIGATOR SCENE (MAIN GAME LOGIC) ---
class NavigatorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'NavigatorScene' });
        this.gameData = {
            supplies: 100,
            morale: 100,
            speed: 50,
            map_height: 750, 
            map_width: 700  
        };
        this.eventTriggered = false;
    }

    preload() {}

    create() {
        const width = this.gameData.map_width;
        const height = this.gameData.map_height;

        // --- 1. GAME ENVIRONMENT (Greyscale Theme) ---
        this.add.graphics()
            .fillStyle(0x000000, 1) // Ocean/Water Black
            .fillRect(0, 0, width, height)
            .fillStyle(0xCCCCCC, 1) // Land Gray
            .fillTriangle(350, 750, 700, 750, 700, 0)
            .fillCircle(380, 680, 50); 
        
        // --- 2. PLAYER SPRITE (Full Ship Emoji) ---
        // Changed to ⛵ for a better visual representation of a ship.
        this.ship = this.add.text(380, 700, '⛵', { fontSize: 36, fill: '#FFFFFF' }).setOrigin(0.5).setInteractive(); 
        this.physics.add.existing(this.ship); 
        this.ship.body.setDamping(true).setDrag(0.99).setMaxVelocity(100);

        // --- 3. UI/HUD ---
        const macTextStyle = { fontSize: '18px', fill: '#000000', fontFamily: 'Courier New, monospace' };
        
        this.add.graphics()
            .fillStyle(0xDDDDDD, 1) 
            .lineStyle(2, 0x000000, 1)
            .strokeRect(10, 10, 200, 60)
            .fillRect(10, 10, 200, 60);

        this.supplyText = this.add.text(20, 15, 'Supplies: 100', macTextStyle);
        this.moraleText = this.add.text(20, 40, 'Morale: 100%', macTextStyle);
        
        this.feedbackText = this.add.text(width / 2, 70, '', 
            { fontSize: '18px', fill: '#000000', backgroundColor: '#FFFFFF', padding: { x: 5, y: 2 } })
            .setOrigin(0.5).setDepth(5).setVisible(false);

        this.cursors = this.input.keyboard.createCursorKeys();

        // --- 5. EVENT LOCATIONS (Greyscale Theme) ---
        eventData.forEach(event => {
            // Anchor icon, now black/white
            this.add.text(event.x, event.y, '⚓', { fontSize: 24, fill: '#FFFFFF' }).setOrigin(0.5);
        });

        // --- 6. LOGBOOK PANEL ---
        this.logbookPanel = this.createLogbookWindow().setDepth(100).setVisible(false);
        this.updateHUD();
    }
    
    createLogbookWindow() {
        const width = this.gameData.map_width;
        const height = this.gameData.map_height;
        const panelW = 450; 
        const panelH = 350; 
        const x = width / 2;
        const y = height / 2;

        let container = this.add.container(x, y);

        let graphics = this.add.graphics();
        graphics.fillStyle(0xFFFFFF, 1); 
        graphics.lineStyle(3, 0x000000, 1);
        graphics.fillRect(-panelW / 2, -panelH / 2, panelW, panelH);
        graphics.strokeRect(-panelW / 2, -panelH / 2, panelW, panelH);

        graphics.fillStyle(0xCCCCCC, 1); 
        graphics.fillRect(-panelW / 2 + 1, -panelH / 2 + 1, panelW - 2, 25);
        
        this.logbookTitle = this.add.text(0, -panelH / 2 + 5, ' CABRILLO\'S LOGBOOK ', { fontSize: 16, fill: '#000000', fontFamily: 'Courier New, monospace' }).setOrigin(0.5);

        const contentWidth = panelW - 40; 
        const textStyleBase = { fill: '#000000', fontFamily: 'Courier New, monospace' };
        
        this.logbookText = this.add.text(-panelW/2 + 20, -130, '', { 
            ...textStyleBase,
            fontSize: 16,
            wordWrap: { width: contentWidth }
        });
        
        this.questionText = this.add.text(-panelW/2 + 20, 20, '', { 
            ...textStyleBase,
            fontSize: 18, 
            fontStyle: 'bold',
            wordWrap: { width: contentWidth }
        });

        container.add([graphics, this.logbookTitle, this.logbookText, this.questionText]);
        return container;
    }

    update() {
        // FIX: Halt movement and resource drain when an event is triggered
        if (this.eventTriggered) {
            this.ship.body.setAcceleration(0);
            this.ship.body.setVelocity(0);
            this.ship.body.setAngularVelocity(0);
            return; 
        }

        this.handleInput();
        this.updateResources();
        this.checkEvents();
        this.checkGameOver();
    }

    handleInput() {
        if (this.cursors.up.isDown) {
            this.physics.velocityFromRotation(this.ship.rotation - Math.PI / 2, 200, this.ship.body.acceleration);
        } else {
            this.ship.body.setAcceleration(0);
        }

        if (this.cursors.left.isDown) {
            this.ship.body.setAngularVelocity(-100);
            this.ship.rotation -= 0.05; 
        } else if (this.cursors.right.isDown) {
            this.ship.body.setAngularVelocity(100);
            this.ship.rotation += 0.05;
        } else {
            this.ship.body.setAngularVelocity(0);
        }
        this.physics.world.wrap(this.ship, 0); 
    }

    updateResources() {
        if (Phaser.Math.Between(1, 90) === 1) { 
            this.gameData.supplies -= 1;
            this.updateHUD();
        }
    }

    updateHUD() {
        this.gameData.supplies = Phaser.Math.Clamp(this.gameData.supplies, 0, 100);
        this.gameData.morale = Phaser.Math.Clamp(this.gameData.morale, 0, 100);

        this.supplyText.setText(`Supplies: ${this.gameData.supplies} (min:20)`);
        this.moraleText.setText(`Morale: ${this.gameData.morale}% (min:40)`);

        this.supplyText.setFill(this.gameData.supplies < 20 ? '#FFFFFF' : '#000000');
        this.supplyText.setBackgroundColor(this.gameData.supplies < 20 ? '#000000' : null);
        this.moraleText.setFill(this.gameData.morale < 40 ? '#FFFFFF' : '#000000');
        this.moraleText.setBackgroundColor(this.gameData.morale < 40 ? '#000000' : null);
    }

    checkEvents() {
        eventData.forEach(event => {
            if (event.triggered) return;
            let distance = Phaser.Math.Distance.Between(this.ship.x, this.ship.y, event.x, event.y);

            if (distance < 50) {
                this.triggerEvent(event);
            }
        });
    }

    triggerEvent(event) {
        this.eventTriggered = true;
        this.logbookPanel.setVisible(true);

        this.logbookTitle.setText(` LOGBOOK: ${event.location_name} `);
        this.logbookText.setText(event.logbook_text);
        this.questionText.setText(event.question);

        if (this.choiceButtons) { this.choiceButtons.destroy(); }
        this.choiceButtons = this.add.group();

        const panelW = 450;
        const buttonStart = -panelW/2 + 20;
        const buttonContentWidth = panelW - 40; // Use same content width for buttons

        event.choices.forEach((choice, index) => {
            let buttonY = 80 + (index * 40); 
            
            // FIX: Implement word wrap for the button text
            let buttonText = this.add.text(
                buttonStart, buttonY, 
                `[ ${choice.text} ]`, { 
                fontSize: 16, fill: '#000000', backgroundColor: '#DDDDDD',
                padding: { x: 5, y: 2 }, fontFamily: 'Courier New, monospace',
                wordWrap: { width: buttonContentWidth } // <-- Crucial Fix for Wrapping
            }).setInteractive({ useHandCursor: true });
            
            buttonText.on('pointerover', () => buttonText.setBackgroundColor('#000000').setFill('#FFFFFF'));
            buttonText.on('pointerout', () => buttonText.setBackgroundColor('#DDDDDD').setFill('#000000'));
            buttonText.on('pointerdown', () => this.handleChoice(choice, event));

            this.choiceButtons.add(buttonText);
            this.logbookPanel.add(buttonText);
        });
    }

    handleChoice(choice, event) {
        this.gameData.supplies += choice.supplies_change;
        this.gameData.morale += choice.morale_change;
        event.triggered = true;

        this.updateHUD();
        
        this.feedbackText.setText(`[ ${choice.feedback} ]`).setVisible(true);
        this.time.delayedCall(3000, () => this.feedbackText.setVisible(false));

        this.logbookPanel.setVisible(false);
        this.choiceButtons.destroy();
        this.eventTriggered = false; 
    }
    
    checkGameOver() {
        if (this.gameData.supplies <= 0 || this.gameData.morale <= 0) {
            this.showEndScreen('GAME OVER', 'DEFEAT: The mission failed due to lack of supplies or crew unrest.');
        } else if (eventData.every(e => e.triggered) && this.ship.y < 100) {
            this.showEndScreen('MISSION SUCCESS', 'VICTORY: All ports discovered! Morale maintained and mission successful!');
        }
    }

    showEndScreen(title, message) {
        this.eventTriggered = true; 
        
        let endPanel = this.add.graphics().fillStyle(0x000000, 1).fillRect(0, 0, this.gameData.map_width, this.gameData.map_height).setDepth(200);
        
        let alertW = 400;
        let alertH = 200;
        let alertX = this.gameData.map_width / 2;
        let alertY = this.gameData.map_height / 2;
        
        this.add.graphics().fillStyle(0xFFFFFF, 1).lineStyle(3, 0x000000, 1)
            .fillRect(alertX - alertW / 2, alertY - alertH / 2, alertW, alertH)
            .strokeRect(alertX - alertW / 2, alertY - alertH / 2, alertW, alertH).setDepth(201);
            
        this.add.text(alertX, alertY - 50, title, {
            fontSize: 24, fill: '#000000', fontFamily: 'Courier New, monospace', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(202);

        this.add.text(alertX, alertY + 10, message, {
            fontSize: 18, fill: '#000000', fontFamily: 'Courier New, monospace',
            wordWrap: { width: alertW - 40 }
        }).setOrigin(0.5).setDepth(202);
    }
}

// --- PHASER GAME INITIALIZATION ---
const config = {
    type: Phaser.AUTO,
    width: 700, 
    height: 750, 
    parent: 'game-container', 
    physics: {
        default: 'arcade',
        arcade: {
            debug: false 
        }
    },
    scene: [IntroScene, NavigatorScene] 
};

new Phaser.Game(config);
