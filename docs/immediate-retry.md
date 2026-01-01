# Immediate Retry - Learning Strategy

When you make a speech error, the app immediately repeats the same phrase until you say it correctly twice. Only then does it move on.

## How It Works

1. **You answer incorrectly** - the phrase appears again immediately
2. **Practice until 2 correct** - keep repeating until you get it right twice (one mistake allowed between successes)
3. **No progress saved** - these "retry" attempts don't count toward your learning streak
4. **Later verification** - the phrase returns to the regular pool and only counts as learned when you get it right later

## Why This Approach?

### Motor Memory Requires Repetition

Speaking is a **motor skill** - your mouth, tongue, and vocal cords need to learn the movement patterns. Reading or hearing the correct answer isn't enough. You need to physically produce the sound correctly, multiple times, to build muscle memory.

When you fail a phrase and just see the answer, your brain thinks "got it" - but your speech apparatus hasn't learned anything. Immediate retry forces the physical practice.

### Errorless Learning Principle

Research shows that **practicing errors reinforces errors**. If you say something wrong and move on, that incorrect pronunciation pattern gets a little stronger in your brain.

Immediate correction and repetition helps "overwrite" the error with the correct form before it solidifies.

### Spaced Repetition Still Applies

The immediate retry is just "drilling" - it doesn't count as learning. The phrase still needs to come back later (after other phrases) for the success to be "real."

This combines:
- **Immediate drilling** - build motor memory right now
- **Spaced verification** - prove you actually remember later

## Settings

The feature can be toggled in Settings under "Immediate retry" (enabled by default).

Only active in speech mode - in manual mode (show answer / knew / didn't know), immediate retry doesn't make sense since you just saw the answer.

## Technical Details

- Stored in localStorage as `langlearn_immediate_retry`
- Retry state resets when changing language sets
- One failure allowed between successes (prevents getting stuck on difficult phrases)
