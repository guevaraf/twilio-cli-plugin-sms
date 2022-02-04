const { flags } = require('@oclif/command');
const { TwilioClientCommand } = require('@twilio/cli-core').baseCommands;
const { TwilioCliError } = require('@twilio/cli-core').services.error;
const fs = require("fs");
const csv = require("csv-parser");
const { sleep } = require('@twilio/cli-core/src/services/javascript-utilities');
// const createToken = require('../../helpers/createToken.js');
// const jwt = require('jsonwebtoken');

class Send extends TwilioClientCommand {
  constructor(argv, config, secureStorage) {
    super(argv, config, secureStorage);

    this.latestMessages = {
      successfulCount: 0,
      failCount: 0,
      messages: []
    }
  }

  async run() {
    await super.run();

    const props = this.parseProperties() || {};
    this.validatePropsAndFlags(props, this.flags);

    await this.sendSms(this.flags);
  }

  validatePropsAndFlags(props, flags) {
    // ToDo: add validation logic
    // if (!(flags.messagingServiceSid)) {
    //   throw new TwilioCliError('Messaging Service SID is required');
    // }
  }

  async sendSms(flags) {
    if(flags.csv !== undefined && flags.csv !== '') {
      await this.sendCsv(flags.csv, flags.from, flags.pause);
    }
    else {
      await this.sendTestSms(flags.from, flags.to, flags.body);
    }

    return true;
  }

  async sendCsv(csvPath, from, pauseInMilliseconds) {
    if(!fs.existsSync(csvPath)) {
      throw new TwilioCliError('The file path provided doesn\'t exist');
    }

    let csv_contents = [];
    const processContent = async function() {
        // ToDo: change this to a yield iterator of sorts
        await this.csvContentReadDone(csv_contents, from, pauseInMilliseconds);

        console.log(`DONE.\r\nSuccesful count: ${this.latestMessages.successfulCount}\r\nFailed count: ${this.latestMessages.failCount}`);
    }.bind(this);

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => csv_contents.push(data))
      .on('end', processContent);
  }

  async csvContentReadDone(contents, from, pauseInMilliseconds) {
    const sendWithElement = async function(element) {
      let phoneNumber = element['Phone Number'];
      let body = element['Body'];
  
      // ToDo: Horrible way of coupling this but for now is enough
      if (this.flags.verbose) {
        console.log(`Sending to ${phoneNumber}: ${body}`);
      }

      await this.sendTestSms(from, phoneNumber, body, m => {
        if (this.flags.verbose) {
          console.log(`Message sent: ${JSON.stringify(m)}`);
        }
      });
    }.bind(this);
    const awaiter = async function(pause) {
      if (pause > 0)
        await sleep(pause);
    }

    for(const x of contents) {
      await sendWithElement(x);
      await awaiter(pauseInMilliseconds);
    };
  }

  async sendTestSms(from, to, body, callback) {
    const client = this.twilioClient;

    await client.messages
      .create({
        from: from,
        to: to,
        body: body
      })
      .then(message => {
        this.latestMessages.messages.push(message);
        this.latestMessages.successfulCount++;
        
        if(typeof(callback) === 'function')
          callback(message);
      }, error => {
        this.latestMessages.failCount++;
        if (this.flags.verbose)
          console.error(error);
      });
  }
}

Send.description = `Send SMS single or in batch with a CSV file`;

Send.flags = Object.assign(
  {
    csv: flags.string({
      required: false,
      multiple: false,
      description:
        "Path to the CSV containing the SMS info (format: phone number to | body)",
      exclusive: ['to']
    }),
    to: flags.string({
      required: false,
      multiple: false,
      char: 't',
      description: "Destination in E.164 format",
      exclusive: ['csv']
    }),
    from: flags.string({
      default: 'TWLO',
      required: false,
      multiple: false,
      char: 'f',
      description: "Origin in E.164 format (can be alpha)"
    }),
    body: flags.string({
      default: 'This is a test message',
      required: false,
      multiple: false,
      char: 'b',
      description: "Body of the SMS message"
    }),
    pause: flags.string({
      default: 0,
      required: false,
      multiple: false,
      char: 'p',
      dependsOn: ['csv'],
      description: "Time in milliseconds between sends"
    }),
    verbose: flags.boolean({
      default: false,
      char: 'v',
      description: "Produce verbose output"
    })
  },
  TwilioClientCommand.flags
);

module.exports = Send;