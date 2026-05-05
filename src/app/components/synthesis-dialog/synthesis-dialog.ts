import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface SynthesisDialogData {
  title: string;
  instructions: string;
}

@Component({
  selector: 'mimir-synthesis-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule
  ],
  templateUrl: './synthesis-dialog.html',
  styleUrl: './synthesis-dialog.scss'
})
export class SynthesisDialog {
  title: string = '';
  instructions: string = '';

  constructor(
    public dialogRef: MatDialogRef<SynthesisDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSynthesize(): void {
    this.dialogRef.close({
      title: this.title,
      instructions: this.instructions
    });
  }
}
