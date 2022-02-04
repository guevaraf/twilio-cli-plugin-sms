@twilio/plugin-sms
========================

Quick access to SMS API and bulk sending messages.

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
## Setup

### Short version
> Prerequisites: NodeJS, Twilio CLI

1. Clone this repo
2. Install dependencies with:
```sh-session
$ npm i
```
3. Go into the cloned repo and run:
```sh-session
$ twilio plugins:link .
```
4. Now you can run the following command to get help
```sh-session
$ twilio help sms:send 
```
5. To try sending a single test SMS
```sh-session
$ twilio sms:send -t=XXXXXXXXX -b="This is a test message"
```

### Long version (explained)
Head over to the [twilio-cli documentation](https://www.twilio.com/docs/twilio-cli/quickstart).

# Usage

```sh-session
$ twilio help sms:send
Send SMS single or in batch with a CSV file

USAGE
  $ twilio sms:send

OPTIONS
OPTIONAL FLAGS
  -b, --body=body                  [default: This is a test message] Body of the
                                   SMS message

  -f, --from=from                  [default: TWLO] Origin in E.164 format (can
                                   be alpha)

  -l=(debug|info|warn|error|none)  [default: info] Level of logging messages.

  -o=(columns|json|tsv|none)       [default: columns] Format of command output.

  -p, --pause=pause                Time in milliseconds between sends

  -p, --profile=profile            Shorthand identifier for your profile.

  -t, --to=to                      Destination in E.164 format

  -v, --verbose                    Produce verbose output

  --csv=csv                        Path to the CSV containing the SMS info
                                   (format: phone number to | body)

  --silent                         Suppress output and logs. This is a shorthand
                                   for "-l none -o none".
...
```

# Commands
<!-- commands -->
* [`twilio sms:send`](#twilio-smssend)
<!-- commandsstop -->

## `twilio sms:send`
Used to send single or multiple test messages using Twilio's SMS API. If it is a single message the to and from parameters will be required. For multiple you will need to run a batch using a CSV file. That file has the format:

Phone Number|Body
------------|-----
XXXXXXX     |This is a test message

> where XXXXXXX is the destination number in E.164 format

_See code: [src/commands/sms/send.js](https://github.com/guevaraf/twilio-cli-plugin-sms/blob/1.0.1/src/commands/sms/send.js)_

