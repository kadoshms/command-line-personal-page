/**
 * Created by mor on 03/01/18.
 */
$(document).ready(function() {

    const app = $('#app');

    /**
     * initialize site
     */
    function init() {
        buildCMd();
    }

    /**
     * build app menu
     */
    function buildCMd() {
        const cmd = new Cmd();
        app.find('#cmd').html(cmd.render());
    }

    init();
});