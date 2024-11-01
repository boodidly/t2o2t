import { stdout } from 'process';
import chalk from 'chalk';
import { speakText } from './voice.js';

const TYPING_SPEED = {
  min: 20, // Slightly faster typing
  max: 35  // Slightly faster typing
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function typeText(text, voice = null) {
  // Split text into sentences for better sync
  const sentences = text.split(/([.!?]+\s+)/);
  let currentLine = '';
  const terminalWidth = stdout.columns || 80;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    if (!sentence.trim()) continue;
    
    const words = sentence.split(' ');
    
    // Start speaking the sentence if voice is enabled
    let speechPromise;
    if (voice?.enabled) {
      speechPromise = speakText(sentence, voice.currentVoice);
    }
    
    for (const word of words) {
      // Check if adding the next word would exceed terminal width
      if ((currentLine + word).length > terminalWidth - 5) {
        stdout.write(chalk.white(currentLine) + '\n');
        currentLine = '';
        await sleep(TYPING_SPEED.max);
      }
      
      // Type each character in the word
      for (const char of word) {
        currentLine += char;
        stdout.write(chalk.white(char));
        await sleep(Math.random() * (TYPING_SPEED.max - TYPING_SPEED.min) + TYPING_SPEED.min);
      }
      
      // Add space between words
      if (words.indexOf(word) < words.length - 1) {
        currentLine += ' ';
        stdout.write(' ');
        await sleep(TYPING_SPEED.min);
      }
    }
    
    // Wait for both typing and speech to complete
    if (speechPromise) {
      await speechPromise.catch(err => {
        console.error(chalk.red('Speech error:'), err);
      });
    }
    
    // Shorter pause at the end of sentences
    if (sentence.match(/[.!?]+\s+$/)) {
      await sleep(TYPING_SPEED.max);
    }
  }
  
  // Write any remaining text
  if (currentLine) {
    stdout.write(chalk.white(currentLine));
  }
}