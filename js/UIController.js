import { RandomCityApi } from './apis.js';

export class UIController {
    constructor(manager) {
        this.manager = manager;
    }

    init() {
        this.#setupUIListeners();
    }

    showSaveConfirmOverlay(message, confirmFunction) {
        const overlay = $('#confirmOverlay');
        const textEl = overlay.find('#confirmText');
        const yesBtn = $('#confirmYes');
        const noBtn = $('#confirmNo');

        overlay.addClass('show');
        textEl.text(message);
        yesBtn.off('click').on('click', () => {
            overlay.removeClass('show');
            confirmFunction();
        });
        noBtn.off('click').on('click', () => overlay.removeClass('show'));
        $('#saveGamesOverlay').click();
    }

    showSaveNameFormOverlay() {
        $('#townNameInput').val("");
        $('#saveNameFormOverlay').addClass('show');
        setTimeout(() => $('#townNameInput').focus(), 10);
    }

    // ### ### ### ### ### Event Listeners ### ### ### ### ###

    #setupUIListeners() {
        this.#setupMusicToggle();
        this.#setupGameLoopControls();
        this.#setupSpaceKeyListener();
        this.#setupMenuToggle();
        this.#setupHelpToggle();
        this.#setupBuyButtons();
        this.#setupSavesListeners();
        this.#setupSaveNameListeners();
    }

    #setupMusicToggle() {
        $('#soundCheckbox').change(() => {
            if ($('#soundCheckbox').prop('checked')) {
                this.manager.startMusic();
                $('#soundIcon').text('🕪');
            } else {
                this.manager.stopMusic();
                $('#soundIcon').text('🕨');
            }
        });
    }

    #setupGameLoopControls() {
        // Loop running state
        $('#gameStateToggle').click(() => {
            let isRunning = this.manager.toggleGameLoop();
            let btnText = (isRunning) ? 'Stop' : 'Start';
            $('#gameStateToggle').text(btnText);
        });

        // Loop speed
        $('#simulationSpeedBtn').click(() => {
            $('#speed').text('x' + this.manager.nextGameLoopSpeed());
        });

        // Game stop and restart
        $('#restartBtn').click(() => {
            this.manager.restartGame();
            $('#gameStateToggle').text('Start');
        });
    }

    #setupSpaceKeyListener() {
        $(document).keydown((event) => {
            if (event.target.tagName === 'INPUT' ||
                event.target.tagName === 'TEXTAREA') return;
            if (event.code === 'Space') $('#gameStateToggle').click();
        });
    }

    #setupMenuToggle() {
        $('#menuBtn').click(() => {
            $('#menuBtn').toggleClass('show');
        });
    }

    #setupHelpToggle() {
        $('#helpBtn').click(() => {
            $('#helpBtn').toggleClass('show');
        });
    }

    #setupBuyButtons() {
        $('#buyResidentBtn').click(() => this.manager.placeGameNode('resident'));
        $('#buyCommercialBtn').click(() => this.manager.placeGameNode('commercial'));
        $('#buyFactoryBtn').click(() => this.manager.placeGameNode('factory'));
    }

    // Save Slots
    #setupSavesListeners() {
        $('#saveGamesOverlay').click(function () {
            $(this).removeClass('show');
        });
        $('#saveGamesOverlay .savegames-content').click(event => event.stopPropagation());

        $('#loadGameBtn').click(() => {
            this.manager.setSaveAction('load');
            $('#saveGamesOverlay').addClass('show');
        });

        $('#saveGameBtn').click(() => {
            this.manager.setSaveAction('save');
            $('#saveGamesOverlay').addClass('show');
        });

        ['1', '2', '3'].forEach(slotId => {
            $(`#saveSlotBtn${slotId}`).click(() => this.manager.saveAction(slotId));
            $(`#deleteSave${slotId}`).click(() => this.#deleteGame(slotId));
        });
    }

    #deleteGame(slotId) {
        this.showSaveConfirmOverlay(
            "Are you sure you want to delete savefile?",
            () => { this.manager.deleteSave(slotId); }
        )
    }

    #setupSaveNameListeners() {
        $('#saveNameFormOverlay').click(function () {
            $(this).removeClass('show');
        });
        $('#saveNameFormOverlay .save-name-content').click(event => event.stopPropagation());
        $('#saveNameBtn').click(() => this.#setSaveSlotName());
        $('#townNameRandomizer').click(async () => await this.#RandomizeTownName());
    }

    #setSaveSlotName() {
        let name = $('#townNameInput').val();
        if (name.trim() === '') {
            alert.error("Name cannot be empty");
            return;
        };
        this.manager.saveNewTownName(name);
        $('#townNameDisplay').text(name);
        $('#saveNameFormOverlay').removeClass('show');
    }

    async #RandomizeTownName() {
        const saveBtn = $('#saveNameBtn');
        saveBtn.prop('disabled', true);
        saveBtn.text("Wait..");

        const nameInput = $('#townNameInput');
        const randomName = await RandomCityApi.fetchRandomCity();
        nameInput.val(randomName);

        saveBtn.prop('disabled', false);
        saveBtn.text("Save");
    }
}