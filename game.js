// game.js (REVISED)

// --- CORE GAME DATA (THE EDUCATIONAL CONTENT) ---
const eventData = [
    // Data remains the same, but the coordinates (x, y) are adjusted for the smaller map size (700x750)
    {
        location_name: "San Diego Bay",
        x: 380, y: 650, 
        logbook_text: "We entered a port and named it San Miguel. The land is excellent, and we saw signs of people. Morale is high, but we need supplies.",
        question: "Do you approach the local Kumeyaay people to trade for vital supplies, or cautiously sail past?",
        choices: [
            { text: "Trade Fairly (+10 Supplies, +15 Morale)", supplies_change: 10, morale_change: 15, feedback: "Respectful trade built trust. Morale UP." },
            { text: "Sail Past (+0 Supplies, -10 Morale)", supplies_change: 0, morale_change: -10, feedback: "The crew worried about resources and lost confidence. Morale DOWN." }
        ],
        triggered: false
    },
    {
        location_name: "Santa Catalina Island",
        x: 250, y: 400,
        logbook_text: "The seas are rough. We anchored near an island where the people came out in many canoes and were friendly. A native was injured nearby.",
        question: "Do you spend valuable supplies and time to treat the injured person?",
        choices: [
            { text: "Provide Care (-8 Supplies, +20 Morale)", supplies_change: -8, morale_change: 20, feedback: "Showing mercy is a virtue, and the local people offered guidance. Morale HIGH." },
            { text: "Ignore and Continue (+0 Supplies, -15 Morale)", supplies_change: 0, morale_change: -15, feedback: "The crew lost respect for the mission's values. Morale LOW." }
        ],
        triggered: false
    },
    {
        location_name: "Point Conception",
        x: 100, y: 200,
        logbook_text: "We encountered a storm so violent we thought we would perish. The wind tore the sails and the waves were enormous.",
        question: "A harsh storm threatens. Do you: **A)** Risk the narrow coastal channel, or **B)** Go around the treacherous point?",
        choices: [
            { text: "Risk Channel (-20 Supplies, -5 Morale)", supplies_change: -20, morale_change: -5, feedback: "The risk was high, and the storm damaged supplies. Supplies DOWN." },
            { text: "Take Long Route (-10 Supplies, +10 Morale)", supplies_change: -10, morale_change: 10, feedback: "The crew felt safer and avoided major storm damage. Morale UP." }
        ],
        triggered: false
    }
];

// --- INTRO SCENE (NEW) ---
class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    create() {
        const width = 700;
        const height = 750;

        // Black background
        this.add.graphics().fillStyle(0x000000, 1).fillRect(0, 0, width, height);

        // Retro Mac Window for Intro Text
        const panelW = 500;
        const panelH = 600;
        
        // Window Frame
        let graphics = this.add.graphics();
        graphics.fillStyle(0xFFFFFF, 1); 
        graphics.lineStyle(3, 0x000000, 1);
        graphics.fillRect(width/2 - panelW/2, height/2 - panelH/2, panelW, panelH);
        graphics.strokeRect(width/2 - panelW/2, height/2 - panelH/2, panelW, panelH);

        // Title Bar
        graphics.fillStyle(0xCCCCCC, 1); 
        graphics.fillRect(width/2 - panelW/2 + 1, height/2 - panelH/2 + 1, panelW - 2, 25);
        
        // Content Style
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
            "OBJECTIVE: Reach the top of the map after triggering all anchor points (📍) before supplies run out."
            
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
        
        // Simple hover effect for Mac look
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
            map_height: 750, // Reduced Height
            map_width: 700  // Reduced Width
        };
        this.eventTriggered = false;
    }

    preload() {}

    create() {
        const width = this.gameData.map_width;
        const height = this.gameData.map_height;

        // --- 1. GAME ENVIRONMENT (Retro Style) ---
        // Background and Map Graphics (Black/White/Gray for Mac 6)
        this.add.graphics()
            .fillStyle(0x000000, 1) // Ocean/Water Black
            .fillRect(0, 0, width, height)
            .fillStyle(0xCCCCCC, 1) // Land Gray
            .fillTriangle(350, 750, 700, 750, 700, 0)
            .fillCircle(380, 680, 50); // Baja peninsula start (adjusted coords)
        
        // --- 2. PLAYER SPRITE (Emoji/Text with Physics) ---
        // Ship starts further down for the smaller map
        this.ship = this.add.text(380, 700, '🚢', { fontSize: 36, fill: '#FFFFFF' }).setOrigin(0.5).setInteractive(); 
        this.physics.add.existing(this.ship); 
        this.ship.body.setDamping(true).setDrag(0.99).setMaxVelocity(100);

        // --- 3. UI/HUD (Retro Mac Style) ---
        const macTextStyle = { fontSize: '18px', fill: '#000000', fontFamily: 'Courier New, monospace' };
        
        // Create a dedicated graphics box for the HUD
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

        // --- 4. NAVIGATION CONTROLS ---
        this.cursors = this.input.keyboard.createCursorKeys();

        // --- 5. EVENT LOCATIONS ---
        eventData.forEach(event => {
            this.add.text(event.x, event.y, '⚓', { fontSize: 24, fill: '#FFFF00' }).setOrigin(0.5);
        });

        // --- 6. LOGBOOK PANEL (Retro Mac Window) ---
        this.logbookPanel = this.createLogbookWindow().setDepth(100).setVisible(false);
        this.updateHUD();
    }
    
    // Custom function to create the Mac System 6 style window
    createLogbookWindow() {
        const width = this.gameData.map_width;
        const height = this.gameData.map_height;
        const panelW = 450; // Adjusted for smaller canvas
        const panelH = 350; // Adjusted for smaller canvas
        const x = width / 2;
        const y = height / 2;

        let container = this.add.container(x, y);

        // Mac Window Frame
        let graphics = this.add.graphics();
        graphics.fillStyle(0xFFFFFF, 1); 
        graphics.lineStyle(3, 0x000000, 1);
        graphics.fillRect(-panelW / 2, -panelH / 2, panelW, panelH);
        graphics.strokeRect(-panelW / 2, -panelH / 2, panelW, panelH);

        // Title Bar
        graphics.fillStyle(0xCCCCCC, 1); 
        graphics.fillRect(-panelW / 2 + 1, -panelH / 2 + 1, panelW - 2, 25);
        
        // Title Text
        this.logbookTitle = this.add.text(0, -panelH / 2 + 5, ' CABRILLO\'S LOGBOOK ', { fontSize: 16, fill: '#000000', fontFamily: 'Courier New, monospace' }).setOrigin(0.5);

        // Content (Text Wrapping FIX)
        const contentWidth = panelW - 40; // 410px width
        
        this.logbookText = this.add.text(-panelW/2 + 20, -130, '', { 
            wordWrap: { width: contentWidth }, // FIX: Text wrapping width
            fill: '#000000', fontSize: 16, fontFamily: 'Courier New, monospace' 
        });
        
        this.questionText = this.add.text(-panelW/2 + 20, 20, '', { 
            wordWrap: { width: contentWidth }, // FIX: Text wrapping width
            fill: '#000000', fontSize: 18, fontFamily: 'Courier New, monospace', fontStyle: 'bold' 
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
        // Input logic remains the same, but is skipped if eventTriggered is true (see update())
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

        // Clear and create choice buttons
        if (this.choiceButtons) { this.choiceButtons.destroy(); }
        this.choiceButtons = this.add.group();

        event.choices.forEach((choice, index) => {
            let buttonY = 80 + (index * 40); // Adjusted button spacing for smaller panel
            
            let buttonText = this.add.text(
                -this.logbookPanel.getBounds().width/2 + 20, buttonY, 
                `[ ${choice.text} ]`, { 
                fontSize: 16, fill: '#000000', backgroundColor: '#DDDDDD',
                padding: { x: 5, y: 2 }, fontFamily: 'Courier New, monospace'
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

        // Cleanup and resume
        this.logbookPanel.setVisible(false);
        this.choiceButtons.destroy();
        this.eventTriggered = false; // Resume game loop
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
    width: 700, // FIX: Smaller Width
    height: 750, // FIX: Smaller Height
    parent: 'game-container', 
    physics: {
        default: 'arcade',
        arcade: {
            debug: false 
        }
    },
    scene: [IntroScene, NavigatorScene] // FIX: Start with IntroScene
};

new Phaser.Game(config);
