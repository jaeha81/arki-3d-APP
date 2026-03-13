export interface Command {
  execute(): void
  undo(): void
  description: string
}

export class UndoManager {
  private history: Command[] = []
  private cursor = -1
  private maxHistory = 100

  execute(command: Command): void {
    // cursor 이후 히스토리 제거 (새 분기)
    this.history = this.history.slice(0, this.cursor + 1)
    command.execute()
    this.history.push(command)
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    } else {
      this.cursor++
    }
  }

  undo(): boolean {
    if (this.cursor < 0) return false
    this.history[this.cursor]!.undo()
    this.cursor--
    return true
  }

  redo(): boolean {
    if (this.cursor >= this.history.length - 1) return false
    this.cursor++
    this.history[this.cursor]!.execute()
    return true
  }

  canUndo(): boolean {
    return this.cursor >= 0
  }

  canRedo(): boolean {
    return this.cursor < this.history.length - 1
  }

  clear(): void {
    this.history = []
    this.cursor = -1
  }
}
