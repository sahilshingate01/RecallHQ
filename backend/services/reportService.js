const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const FIXED_USER_ID = '00000000-0000-0000-0000-000000000001';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendDailyReport() {
  try {
    console.log('Generating daily report...');

    // Get current date range (start of today to now)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.toISOString();
    const endOfToday = new Date().toISOString();

    // Fetch Tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', FIXED_USER_ID);

    if (tasksError) throw tasksError;

    // Filter tasks for today's summary
    const completedToday = tasks.filter(t => t.completed && t.completed_at && t.completed_at >= startOfToday).length;
    const pendingTotal = tasks.filter(t => !t.completed).length;
    const createdToday = tasks.filter(t => t.created_at >= startOfToday).length;

    // Fetch Notes stats
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('id')
      .eq('user_id', FIXED_USER_ID)
      .gte('created_at', startOfToday);

    if (notesError) throw notesError;

    // Fetch Reminders stats
    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', FIXED_USER_ID)
      .gte('remind_at', startOfToday);

    if (remindersError) throw remindersError;

    const completedReminders = reminders.filter(r => r.done).length;
    const pendingReminders = reminders.filter(r => !r.done).length;

    // Fetch Projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', FIXED_USER_ID)
      .eq('status', 'active');

    if (projectsError) throw projectsError;

    // Generate HTML Email Content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
          .container { max-width: 650px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%); color: white; padding: 60px 40px; text-align: center; }
          .header h1 { margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.025em; }
          .header p { margin: 12px 0 0; opacity: 0.9; font-size: 18px; font-weight: 500; }
          .content { padding: 40px; }
          .section { margin-bottom: 40px; }
          .section-title { font-size: 20px; font-weight: 700; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 20px; display: flex; align-items: center; }
          .section-title::before { content: ""; display: inline-block; width: 4px; height: 18px; background: #4f46e5; border-radius: 2px; margin-right: 10px; }
          .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
          .stat-card { background: #ffffff; padding: 20px; border-radius: 16px; border: 1px solid #f3f4f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: left; }
          .stat-value { font-size: 32px; font-weight: 800; color: #4f46e5; margin-bottom: 4px; }
          .stat-label { font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
          .list-item { padding: 15px; border-radius: 12px; margin-bottom: 10px; background: #f9fafb; border: 1px solid #f3f4f6; display: flex; align-items: center; transition: all 0.2s; }
          .status-dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 15px; flex-shrink: 0; }
          .status-completed { background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
          .status-pending { background: #f59e0b; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1); }
          .footer { background: #f9fafb; padding: 30px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
          .badge { padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
          .badge-high { background: #fee2e2; color: #ef4444; }
          .badge-medium { background: #fef3c7; color: #f59e0b; }
          .badge-low { background: #dcfce7; color: #10b981; }
          .project-card { border-left: 4px solid #4f46e5; padding-left: 15px; margin-bottom: 15px; }
          .project-name { font-weight: 700; color: #111827; }
          .project-desc { font-size: 13px; color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Daily Recall Report</h1>
            <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="content">
            <div class="section">
              <div class="section-title">Today's Pulse</div>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${completedToday}</div>
                  <div class="stat-label">Tasks Done</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${pendingTotal}</div>
                  <div class="stat-label">Still Pending</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${createdToday}</div>
                  <div class="stat-label">New Created</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${notes.length}</div>
                  <div class="stat-label">Notes Taken</div>
                </div>
              </div>
            </div>

            ${projects.length > 0 ? `
            <div class="section">
              <div class="section-title">Active Projects</div>
              ${projects.slice(0, 3).map(p => `
                <div class="project-card">
                  <div class="project-name">${p.name}</div>
                  <div class="project-desc">${p.description || 'No description provided'}</div>
                </div>
              `).join('')}
            </div>
            ` : ''}

            <div class="section">
              <div class="section-title">Tasks Detailed View</div>
              ${tasks.length === 0 ? '<p style="color: #6b7280; font-style: italic; text-align: center; padding: 20px;">No tasks on your radar.</p>' : ''}
              ${tasks.sort((a, b) => b.completed - a.completed).slice(0, 10).map(task => `
                <div class="list-item">
                  <div class="status-dot ${task.completed ? 'status-completed' : 'status-pending'}"></div>
                  <div style="flex: 1;">
                    <div style="font-weight: 600; color: #111827;">${task.title}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">
                      ${task.type === 'daily' ? 'Daily Ritual' : 'One-time Task'}
                      ${task.priority ? `<span class="badge badge-${task.priority}" style="margin-left: 10px;">${task.priority}</span>` : ''}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <span style="font-size: 12px; font-weight: 600; color: ${task.completed ? '#10b981' : '#f59e0b'};">
                      ${task.completed ? 'DONE' : 'PENDING'}
                    </span>
                  </div>
                </div>
              `).join('')}
              ${tasks.length > 10 ? `<p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 15px;">+ ${tasks.length - 10} more tasks</p>` : ''}
            </div>

            <div class="section" style="background: #fdf2f8; padding: 25px; border-radius: 16px; border: 1px solid #fce7f3;">
              <div class="section-title" style="border: none; margin-bottom: 10px;">Reminders Wrap-up</div>
              <p style="margin: 0; color: #9d174d; font-weight: 500;">
                Today you had <b>${reminders.length}</b> reminders. 
                <span style="color: #be185d;">${completedReminders} were knocked out</span> and 
                <span style="color: #be185d;">${pendingReminders} are waiting for tomorrow.</span>
              </p>
            </div>
          </div>
          <div class="footer">
            <p style="font-weight: 600; color: #4f46e5; margin-bottom: 5px;">RecallHQ Intelligence</p>
            <p style="margin: 0;">Helping you stay productive, every single day.</p>
            <div style="margin-top: 20px; font-size: 12px;">
              &copy; ${new Date().getFullYear()} RecallHQ. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send the email
    const info = await transporter.sendMail({
      from: `"RecallHQ" <${process.env.SMTP_USER}>`,
      to: process.env.REPORT_RECIPIENT,
      subject: `Daily Report - ${new Date().toLocaleDateString()}`,
      html: emailHtml,
    });

    console.log('Daily report sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending daily report:', error);
  }
}

module.exports = { sendDailyReport };
