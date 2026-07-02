import { Component } from '@angular/core';

interface Metric {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

interface EvaluationTask {
  id: string;
  title: string;
  category: string;
  reviewer: string;
  status: 'In Review' | 'Completed' | 'Needs Attention';
  statusKey: 'review' | 'completed' | 'attention';
  qualityScore: number;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly currentDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  protected readonly metrics: Metric[] = [
    {
      label: 'Active Tasks',
      value: '24',
      change: '+12% this week',
      positive: true,
    },
    {
      label: 'Average Quality',
      value: '94.8%',
      change: '+2.4% this month',
      positive: true,
    },
    {
      label: 'Pending Reviews',
      value: '7',
      change: '3 high priority',
      positive: false,
    },
    {
      label: 'Tasks Completed',
      value: '86',
      change: '+18 this week',
      positive: true,
    },
  ];

  protected readonly tasks: EvaluationTask[] = [
    {
      id: 'EV-1042',
      title: 'Angular reactive form validation',
      category: 'Code Review',
      reviewer: 'Samuel Kamande',
      status: 'In Review',
      statusKey: 'review',
      qualityScore: 92,
    },
    {
      id: 'EV-1041',
      title: 'RxJS subscription leak analysis',
      category: 'Debugging',
      reviewer: 'Amina Noor',
      status: 'Completed',
      statusKey: 'completed',
      qualityScore: 98,
    },
    {
      id: 'EV-1040',
      title: 'SCSS architecture assessment',
      category: 'Maintainability',
      reviewer: 'Samuel Kamande',
      status: 'Needs Attention',
      statusKey: 'attention',
      qualityScore: 76,
    },
    {
      id: 'EV-1039',
      title: 'Angular component accessibility',
      category: 'Accessibility',
      reviewer: 'Daniel Otieno',
      status: 'Completed',
      statusKey: 'completed',
      qualityScore: 96,
    },
  ];
}
