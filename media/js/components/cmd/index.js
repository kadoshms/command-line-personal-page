/**
 * Created by mor on 03/01/18.
 */
const KEYCODE = {
    ENTER: 13,
    BACKSPACE: 8,
    TAB: 9,
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    CTRL: 17
};

const MAIL_EP = 'http://localhost:3000/sendmail';
const REBOOT = '#reboot#';

function Button(color, handler) {
    this.color = color;
    this.handler = handler;
}

Button.prototype.render = function() {
    this.el = $('<i class="fa fa-circle button" style="color:' + this.color + '"></i>');

    this.el.bind('click', this.handler);

    return this.el;
};

function Cmd() {
    this.command = '';
    this.prefix = 'guest@cs.bgu.ac.il~morkad$ ';
}

const commands = {
    'whoami': function() {
        return 'Hello, my name is Mor Kadosh and I am a third year student for Computer Science & Economics';
    },
    'ls': function(args) {

        switch (args[0]) {
            case 'projects':
                return (
                    'ionic2-autocomplete https://github.com/kadoshms/ionic2-autocomplete\n'
                    + 'react-jvectormap https://github.com/kadoshms/react-jvectormap\n'
                    + '2048 https://github.com/kadoshms/2048'
                );
            default:
                return 'media node_modules index.html package.json';
        }
    },
    'open': function(args) {


        switch (args[0]) {
            case 'github':
                window.open('https://github.com/kadoshms');
                break;
            case 'linkedin':
                window.open('https://www.linkedin.com/in/mor-kadosh-75371974/');
        }

        return 'opening ' + args[0];
    },
    'default': function() {
        return (
            "The program '"+ this.command +"' is currently not installed. You can install it by typing: \n"
            + "sudo apt-get install " + this.command
        )
    },
    'help': function() {
        var output = "\nWelcome to my command line cv. Here's some available commands:\n\n";

        Object.keys(commands).filter(function(key) {
            return key !== 'default';
        }).forEach(function(command, i) {
            output = output.concat( (i+1) + ') ' + command + '\n');
        });

        return output;
    },
    'reboot': function() {
        return REBOOT;
    },
    'mail': function(args, callback) {
        const self = this;
        const email = args[0], body = args[1];

        $.post(MAIL_EP, { email: email, body: body }, function(data) {
            callback.apply(self, [JSON.stringify(data)])
        })
        .fail(function() {
            callback.apply(self, ['curl: (6) Could not resolve host: ' + url]);
        });
    }
};

/**
 * print output to command line
 * @param output
 */
Cmd.prototype.printOutput = function(output) {
    const textarea = this.el.find('textarea');
    const value = textarea.val();

    if (output === REBOOT) {
        textarea.val(this.prefix);
    } else if (output) {
        textarea.val(value + '\n' + output + '\n' + this.prefix);
    }
};

/**
 * parse command
 */
Cmd.prototype.parseCommand = function() {
    const textarea = this.el.find('textarea');
    const value = textarea.val();

    const commandChunks = this.command.split(' ');

    if (commandChunks[0] === '') {
        textarea.val(value + '\n' + this.prefix);
        return;
    }

    const commandName = commandChunks[0];

    const command = commands[commandName] || commands['default'];

    const output = command.apply(this, [commandChunks.slice(1), this.printOutput]);

    if (typeof output !== 'object') {
        this.printOutput(output);
    }
};

/**
 * try to autoomplete
 */
Cmd.prototype.autoComplete = function() {
    const self = this;
    const textarea = this.el.find('textarea');
    const value = textarea.val();
    const beginning = self.command;

    Object.keys(commands).forEach(function(command) {
        if (command.startsWith(beginning)) {
            const complete = command.substr( beginning.length , command.length - 1 );
            textarea.val(value + complete);
            self.command = beginning + complete;
        }
    });
};

/**
 * handle key press
 * @param evt
 */
Cmd.prototype.handleKeyPress = function(evt) {

    const textarea = this.el.find('textarea');

    // tab press
    if (evt.keyCode === KEYCODE.TAB) {
        this.autoComplete();
        evt.preventDefault();
        return;
    }

    const valid =
        (evt.keyCode > 47 && evt.keyCode < 58) ||
        (evt.keyCode === 32 || evt.keyCode === 13) ||
        (evt.keyCode > 64 && evt.keyCode < 91) ||
        (evt.keyCode > 95 && evt.keyCode < 112) ||
        (evt.keyCode > 185 && evt.keyCode < 193) ||
        (evt.keyCode > 218 && evt.keyCode < 223);

    if (evt.keyCode === KEYCODE.UP || evt.keyCode === KEYCODE.DOWN || evt.keyCode === KEYCODE.CTRL) {
        evt.preventDefault();
    } else if(evt.keyCode === KEYCODE.LEFT) {
        const char = textarea.val().charAt(textarea.prop('selectionStart') - 2);

        if (char === '$') {
            evt.preventDefault();
        }

    } else if (evt.keyCode === KEYCODE.ENTER) {
        this.parseCommand();
        this.command = '';
        evt.preventDefault();
    } else if(evt.keyCode === KEYCODE.BACKSPACE) {

        // prevent bacspace on previous commands
        if (this.command === '' || textarea.val().slice(-1) === ' ' && this.command === '') {
            evt.preventDefault();
        } else {
            this.command = this.command.slice(0, -1);
        }
    } else if (valid) {
        this.command = this.command.concat(evt.key);
    }

};

/**
 * maximize window
 */
Cmd.prototype.maximize = function() {
    this.el.css({ width: '100%', height: '100%' });
};

/**
 * maximize window
 */
Cmd.prototype.minimize = function() {
    this.el.css({ width: '80%', height: '80%' });
};

Cmd.prototype.render = function() {

    const self = this;

    const closeButton = new Button('#e74c3c');

    const minimizeButton = new Button('#f1c40f', function() {
        self.minimize();
    });

    const maximizeButton = new Button('#2ecc71', function() {
        self.maximize();
    });

    const buttons = $('<div class="buttons" />');

    // add buttons
    buttons.append(closeButton.render())
            .append(minimizeButton.render())
            .append(maximizeButton.render());

    this.el = $(
        '<div>'
        +   '<div class="header">'
        +       '<div class="title">' + this.prefix + ' lab-10 command line' + '</div>'
        +   '</div>'
        +   '<textarea spellcheck="false">'+ this.prefix +'</textarea>' +
        +'</div>'
    );

    const textarea = this.el.find('textarea');

    // add buttons
    this.el.find('div.title').before(buttons);

    textarea.bind('keydown', this.handleKeyPress.bind(this));

    return this.el;
};