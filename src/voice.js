import say from 'say';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { VOICES } from './config.js';

let currentVoice = 'Alex';
let isVoiceEnabled = false;
let speechRate = 1.4; // Increased speech rate for better sync

// Initialize say.js and check available voices
say.getInstalledVoices((err, voices) => {
  if (err) {
    console.error(chalk.red('Error initializing voice system:'), err);
    isVoiceEnabled = false;
  }
});

export async function selectVoice() {
  const { voice } = await inquirer.prompt([{
    type: 'list',
    name: 'voice',
    message: 'Select a voice:',
    choices: Object.entries(VOICES).map(([name, description]) => ({
      name: `${name} (${description})`,
      value: name
    }))
  }]);
  
  currentVoice = voice;
  
  // Test the selected voice
  return new Promise((resolve) => {
    say.speak('Voice test successful', voice, speechRate, (err) => {
      if (err) {
        process.stdout.write(chalk.red(`\nError testing voice: ${err.message}\n`));
        isVoiceEnabled = false;
      } else {
        process.stdout.write(chalk.green(`\nVoice set to: ${voice}\n`));
      }
      resolve();
    });
  });
}

export function toggleVoice() {
  isVoiceEnabled = !isVoiceEnabled;
  process.stdout.write(chalk.green(`\nVoice output ${isVoiceEnabled ? 'enabled' : 'disabled'}\n`));
  if (isVoiceEnabled) {
    process.stdout.write(chalk.dim(`Current voice: ${currentVoice}\n`));
  } else {
    say.stop(); // Stop any ongoing speech
  }
  return isVoiceEnabled;
}

export function getVoiceStatus() {
  return {
    enabled: isVoiceEnabled,
    currentVoice,
    speechRate
  };
}

export function listVoices() {
  process.stdout.write(chalk.cyan('\nAvailable voices:\n'));
  Object.entries(VOICES).forEach(([name, description]) => {
    process.stdout.write(chalk.yellow(`${name}: `) + chalk.white(`${description}\n`));
  });
  process.stdout.write('\n');
}

// Helper function to speak text with proper error handling
export function speakText(text, voice = currentVoice) {
  return new Promise((resolve, reject) => {
    if (!isVoiceEnabled) {
      resolve();
      return;
    }

    say.speak(text, voice, speechRate, (err) => {
      if (err) {
        console.error(chalk.red('Speech error:'), err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}