import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-page',
  imports: [ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrls: ['../page.scss', './settings.scss'],
})
export class SettingsPage {
  private readonly formBuilder = inject(FormBuilder);

  protected saved = false;

  protected readonly settingsForm =
    this.formBuilder.nonNullable.group({
      emailNotifications: true,
      qualityAlerts: true,
      weeklySummary: false,
      compactLayout: false,
    });

  protected save(): void {
    localStorage.setItem(
      'evalops-settings',
      JSON.stringify(this.settingsForm.getRawValue()),
    );

    this.saved = true;
  }
}
