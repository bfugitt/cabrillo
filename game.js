// game.js

// --- CORE GAME DATA (THE EDUCATIONAL CONTENT) ---
const eventData = [
    {
        location_name: "San Diego Bay",
        x: 450, y: 750, 
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
        x: 300, y: 450,
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
        x: 150, y: 250,
        logbook_text: "We encountered a storm so violent we thought we would perish. The wind tore the sails and the waves were enormous.",
        question: "A harsh storm threatens. Do you: **A)** Risk the narrow coastal channel, or **B)** Go around the treacherous point?",
        choices: [
            { text: "Risk Channel (-20 Supplies, -5 Morale)", supplies_change: -20, morale_change: -5, feedback: "The risk was high, and the storm damaged supplies. Supplies DOWN." },
            { text: "Take Long Route (-10 Supplies, +10 Morale)", supplies_change: -10, morale_change: 10, feedback: "The crew felt safer and avoided major storm damage. Morale UP." }
        ],
        triggered: false
    }
];

class NavigatorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'NavigatorScene' });
        this.gameData = {
            supplies: 100,
            morale: 100,
            speed: 50,
            map_height: 900,
            map_width: 800
        };
        this.eventTriggered = false;
    }

    preload() {
        // No external assets, using built-in graphics and text.
    }

    create() {
        // --- 1. GAME ENVIRONMENT (Retro Style) ---
        // Background and Map Graphics (Black/White/Gray for Mac 6)
        this.add.graphics()
            .fillStyle(0x000000, 1) // Ocean/Water Black
            .fillRect(0, 0, this.gameData.map_width, this.gameData.map_height)
            .fillStyle(0xCCCCCC, 1) // Land Gray
            .fillTriangle(400, 900, 800, 900, 800, 0)
            .fillCircle(450, 780, 50); 
        
        // --- 2. PLAYER SPRITE (Emoji/Text with Physics) ---
        this.ship = this.add.text(450, 850, '🚢', { fontSize: 36, fill: '#FFFFFF' }).setOrigin(0.5).setInteractive(); 
        this.physics.add.existing(this.ship); 
        this.ship.body.setDamping(true).setDrag(0.99).setMaxVelocity(100);

        // --- 3. UI/HUD (Retro Mac Style) ---
        const macTextStyle = { fontSize: '18px', fill: '#000000', fontFamily: 'Courier New, monospace' };
        
        // Create a dedicated graphics box for the HUD to fit the theme
        this.add.graphics()
            .fillStyle(0xDDDDDD, 1) // Light gray background
            .lineStyle(2, 0x000000, 1)
            .strokeRect(10, 10, 200, 60)
            .fillRect(10, 10, 200, 60);

        this.supplyText = this.add.text(20, 15, 'Supplies: 100', macTextStyle);
        this.moraleText = this.add.text(20, 40, 'Morale: 100%', macTextStyle);
        
        this.feedbackText = this.add.text(this.gameData.map_width / 2, 70, '', 
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
        const x = this.gameData.map_width / 2;
        const y = this.gameData.map_height / 2;
        const panelW = 500;
        const panelH = 380;

        let container = this.add.container(x, y);

        // Mac Window Frame (White Fill, Thick Black Border, Drop Shadow)
        let graphics = this.add.graphics();
        graphics.fillStyle(0xFFFFFF, 1); 
        graphics.lineStyle(3, 0x000000, 1);
        graphics.fillRect(-panelW / 2, -panelH / 2, panelW, panelH);
        graphics.strokeRect(-panelW / 2, -panelH / 2, panelW, panelH);

        // Title Bar (Striped/Gray Top)
        graphics.fillStyle(0xCCCCCC, 1); 
        graphics.fillRect(-panelW / 2 + 1, -panelH / 2 + 1, panelW - 2, 25);
        
        // Window Close Button (Blocky 'X')
        this.add.text(-panelW / 2 + 5, -panelH / 2 + 3, '◼', { fontSize: 18, fill: '#000000' });
        
        // Title Text
        this.logbookTitle = this.add.text(0, -panelH / 2 + 5, ' CABRILLO\'S LOGBOOK ', { fontSize: 16, fill: '#000000', fontFamily: 'Courier New, monospace' }).setOrigin(0.5);

        // Content
        this.logbookText = this.add.text(-230, -130, '', { wordWrap: { width: 460 }, fill: '#000000', fontSize: 16, fontFamily: 'Courier New, monospace' });
        this.questionText = this.add.text(-230, 20, '', { fill: '#000000', fontSize: 18, fontFamily: 'Courier New, monospace', fontStyle: 'bold' });

        container.add([graphics, this.logbookTitle, this.logbookText, this.questionText]);
        return container;
    }

    update() {
        if (this.eventTriggered) return;

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
        if (Phaser.Math.Between(1, 90) === 1) { // Faster decay for testing
            this.gameData.supplies -= 1;
            this.updateHUD();
        }
    }

    updateHUD() {
        this.gameData.supplies = Phaser.Math.Clamp(this.gameData.supplies, 0, 100);
        this.gameData.morale = Phaser.Math.Clamp(this.gameData.morale, 0, 100);

        this.supplyText.setText(`Supplies: ${this.gameData.supplies} (min:20)`);
        this.moraleText.setText(`Morale: ${this.gameData.morale}% (min:40)`);

        // Use Mac-style inverse text for warnings
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
            let buttonY = 120 + (index * 40);
            
            // Retro Mac Button Style (Thick Border, Inverted on Hover)
            let buttonText = this.add.text(-230, buttonY, `[ ${choice.text} ]`, { 
                fontSize: 16, 
                fill: '#000000', 
                backgroundColor: '#DDDDDD',
                padding: { x: 5, y: 2 },
                fontFamily: 'Courier New, monospace'
            }).setInteractive({ useHandCursor: true });
            
            // Simple hover effect for Mac look
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
        
        // Display UDL Feedback
        this.feedbackText.setText(`[ ${choice.feedback} ]`).setVisible(true);
        this.time.delayedCall(3000, () => this.feedbackText.setVisible(false));

        // Cleanup and resume
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
        
        // Simple black frame with white text for the final screen
        let endPanel = this.add.graphics().fillStyle(0x000000, 1).fillRect(0, 0, this.gameData.map_width, this.gameData.map_height).setDepth(200);
        
        // Draw an 'Alert Box' for the final message
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
    width: 800,
    height: 900,
    // Inject canvas into the 'game-container' div
    parent: 'game-container', 
    physics: {
        default: 'arcade',
        arcade: {
            debug: false 
        }
    },
    scene: NavigatorScene
};

new Phaser.Game(config);