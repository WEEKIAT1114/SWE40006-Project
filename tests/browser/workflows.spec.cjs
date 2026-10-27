const {test,expect}=require('@playwright/test');
const path=require('node:path');
async function ready(page){await expect(page.locator('body')).toHaveAttribute('data-ready','true');}
async function navigate(page,name){await page.getByRole('link',{name,exact:true}).click();await ready(page);}
async function assignment(page,title='Software Engineering project',date='2026-11-12'){
  await page.locator('.page-heading').getByRole('button',{name:'Add assignment',exact:true}).click();
  await page.locator('#assignment-title').fill(title);await page.locator('#assignment-subject').selectOption('Computer Science');await page.locator('#assignment-date').fill(date);await page.locator('#assignment-time').fill('17:00');await page.locator('#assignment-hours').fill('6');
  await page.locator('#save-assignment').click();await expect(page.locator('#assignment-dialog')).not.toBeVisible();
}
async function studyTask(page,title='Research the requirements',date='2026-10-27',related=false){
  await page.getByRole('button',{name:'Add task',exact:true}).click();await page.locator('#task-title').fill(title);await page.locator('#task-date').fill(date);await page.locator('#task-time').fill('10:00');
  if(related)await page.locator('#task-assignment').selectOption({label:'Software Engineering project'});
  await page.locator('#save-task').click();await expect(page.locator('#task-dialog')).not.toBeVisible();
}
test.beforeEach(async({page})=>{await page.clock.setFixedTime(new Date('2026-10-27T04:00:00Z'));await page.goto('/index.html');await ready(page);});

test('assignment create/edit/complete persists across the four pages',async({page})=>{
  await assignment(page);await navigate(page,'Assignments');await page.getByRole('button',{name:'Edit Software Engineering project',exact:true}).click();
  await page.locator('#assignment-date').fill('2026-11-13');await page.locator('#add-checklist-step').click();await page.getByRole('textbox',{name:'Checklist step title'}).fill('Review requirements');await page.getByRole('checkbox',{name:'Checklist step complete'}).check();await page.locator('#save-assignment').click();await expect(page.locator('#assignment-dialog')).not.toBeVisible();
  await page.getByLabel('Status of Software Engineering project',{exact:true}).selectOption('Completed');await expect(page.locator('#assignment-rows')).toContainText('1/1 steps');
  await page.reload();await ready(page);await expect(page.getByLabel('Status of Software Engineering project',{exact:true})).toHaveValue('Completed');
  await navigate(page,'Dashboard');await expect(page.locator('[data-stat="total"]')).toHaveText('1');await expect(page.locator('[data-stat="total-completed"]')).toHaveText('1');
  await navigate(page,'Progress');await expect(page.locator('#donut-percent')).toHaveText('100%');
});
test('study tasks link to assignments, appear in the calendar, and can be rescheduled',async({page})=>{
  await assignment(page);await studyTask(page,'Research the requirements','2026-10-29',true);
  await page.locator('#task-view').selectOption('upcoming');await expect(page.locator('#tasks-list')).toContainText('Research the requirements');
  await navigate(page,'Calendar');await page.getByRole('button',{name:'List',exact:true}).click();await expect(page.locator('#calendar-content')).toContainText('Research the requirements');
  await page.getByRole('button',{name:'Research the requirements',exact:true}).click();await page.locator('#task-date').fill('2026-10-27');await page.locator('#task-title').fill('Research and outline');await page.locator('#save-task').click();await expect(page.locator('#task-dialog')).not.toBeVisible();
  await navigate(page,'Dashboard');await page.getByRole('checkbox',{name:'Complete Research and outline',exact:true}).check();await expect(page.locator('#tasks-list')).toContainText('Research and outline');await navigate(page,'Assignments');await expect(page.locator('#assignment-rows')).toContainText('1/1 study tasks');
});
test('past incomplete tasks remain visible and destructive actions have cancel and undo',async({page})=>{
  await studyTask(page,'Carry unfinished work','2026-10-26');await expect(page.locator('#tasks-list')).toContainText('Overdue');
  await page.getByRole('button',{name:'Delete task Carry unfinished work',exact:true}).click();await page.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page.locator('#tasks-list')).toContainText('Carry unfinished work');
  await page.getByRole('button',{name:'Delete task Carry unfinished work',exact:true}).click();await page.locator('#confirm-accept').click();await expect(page.locator('#tasks-list')).not.toContainText('Carry unfinished work');await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.locator('#tasks-list')).toContainText('Carry unfinished work');
});
test('an open form does not overwrite a new assignment from another tab',async({page,context})=>{
  await assignment(page,'Original assignment');await page.getByRole('button',{name:'Original assignment',exact:true}).click();
  const second=await context.newPage();await second.goto('/assignments.html');await ready(second);await assignment(second,'Created in the second tab');
  await page.locator('#assignment-title').fill('Edited in the first tab');await page.locator('#save-assignment').click();await expect(page.locator('#assignment-dialog')).not.toBeVisible();
  await navigate(page,'Assignments');await expect(page.locator('#assignment-rows')).toContainText('Created in the second tab');await expect(page.locator('#assignment-rows')).toContainText('Edited in the first tab');await second.close();
});
test('reminders identify overdue work and custom subjects are usable',async({page})=>{
  await page.locator('.page-heading').getByRole('button',{name:'Add assignment',exact:true}).click();await page.locator('#assignment-title').fill('Overdue systems report');await page.locator('#assignment-subject').selectOption('__new__');await page.locator('#assignment-custom-subject').fill('Systems Design');await page.locator('#assignment-date').fill('2026-10-26');await page.locator('#save-assignment').click();await expect(page.locator('#assignment-dialog')).not.toBeVisible();
  await page.getByRole('button',{name:/^Notifications/}).click();await expect(page.locator('#notifications')).toContainText('Overdue');await page.getByRole('button',{name:'Mark as read',exact:true}).click();await expect(page.locator('#notification-dot')).toBeHidden();
  await navigate(page,'Assignments');await page.getByLabel('Filter by subject',{exact:true}).selectOption('Systems Design');await expect(page.locator('#assignment-rows')).toContainText('Overdue systems report');await page.getByRole('tab',{name:/Overdue/}).click();await expect(page.locator('#assignment-count')).toHaveText('Showing 1 of 1 assignments');
});
test('JSON backup exports and imports into a fresh browser context',async({page,browser},info)=>{
  await assignment(page,'Backup round trip');await page.getByRole('button',{name:'Edit profile and preferences',exact:true}).click();
  const downloadEvent=page.waitForEvent('download');await page.locator('#export-data').click();const download=await downloadEvent;const file=info.outputPath('workspace-backup.json');await download.saveAs(file);
  const context=await browser.newContext({timezoneId:'Asia/Kuala_Lumpur'});const target=await context.newPage();await target.goto('http://127.0.0.1:8123/index.html');await ready(target);await target.getByRole('button',{name:'Edit profile and preferences',exact:true}).click();await target.locator('#import-file').setInputFiles(file);await expect(target.locator('#import-dialog')).toBeVisible();await target.locator('#import-form').getByRole('button',{name:'Import backup',exact:true}).click();await expect(target.locator('#import-dialog')).not.toBeVisible();await expect(target.locator('[data-stat="total"]')).toHaveText('1');await expect(target.locator('#upcoming-rows')).toContainText('Backup round trip');await context.close();
});
test('a linked focus session completes once and offers a break',async({page})=>{
  await assignment(page);await studyTask(page,'Focused implementation','2026-10-27',true);await page.getByRole('button',{name:'Focus on task Focused implementation',exact:true}).click();
  await page.clock.install({time:new Date('2026-10-27T04:00:00Z')});await page.getByRole('button',{name:'Start focus session',exact:true}).click();await expect(page.getByRole('button',{name:'Pause session',exact:true})).toBeVisible();
  await page.clock.fastForward(25*60*1000);await expect(page.locator('#timer-kind')).toHaveValue('short-break');await expect(page.locator('#focus-goal-label')).toHaveText('1 / 4 sessions today');
  await navigate(page,'Progress');await expect(page.locator('#assignment-effort')).toContainText('25 min');await page.reload();await ready(page);await expect(page.locator('#focus-minutes')).toHaveText('25');
});
test('desktop, mobile, keyboard, and all calendar modes remain usable',async({page},info)=>{
  await page.getByRole('button',{name:'Try sample workspace',exact:true}).click();await expect(page.locator('[data-stat="total"]')).toHaveText('1');
  await expect(page.locator('.toast')).toHaveCount(0,{timeout:7000});await page.screenshot({path:info.outputPath('dashboard-desktop.png'),fullPage:true});await page.setViewportSize({width:390,height:844});await expect(page.locator('#tasks-list')).toContainText('Sample: Research and outline');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.keyboard.press('/');await expect(page.locator('#global-search')).toBeFocused();await page.keyboard.press('Escape');await page.screenshot({path:info.outputPath('dashboard-mobile.png'),fullPage:true});
  await navigate(page,'Calendar');for(const mode of ['Week','List','Month']){await page.getByRole('button',{name:mode,exact:true}).click();await expect(page.locator('#calendar-content')).not.toBeEmpty();}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('previous-snapshot recovery restores a deleted record',async({page})=>{
  await assignment(page,'Recovery exercise');await navigate(page,'Assignments');await page.getByRole('button',{name:'Delete Recovery exercise',exact:true}).click();await page.locator('#confirm-accept').click();await expect(page.locator('#assignment-count')).toHaveText('Showing 0 of 0 assignments');
  await page.getByRole('button',{name:'Edit profile and preferences',exact:true}).click();await page.locator('#recover-data').click();await page.locator('#confirm-accept').click();await expect(page.locator('#profile-dialog')).not.toBeVisible();await expect(page.locator('#assignment-rows')).toContainText('Recovery exercise');
});
test('legacy browser data migrates without replacing coursework with samples',async({browser})=>{
  const context=await browser.newContext({timezoneId:'Asia/Kuala_Lumpur'});await context.addInitScript(()=>{
    if(!localStorage.getItem('studysprint.workspace.v1'))localStorage.setItem('studysprint.workspace.v1',JSON.stringify({version:1,profile:{name:'Student',course:'Computer Science',goal:4},assignments:[{id:'legacy-assignment',title:'My existing coursework',subject:'Physics',dueDate:'2026-11-12',priority:'High',status:'In Progress',notes:''}],tasks:[{id:'legacy-task',title:'My unfinished notes',subject:'Physics',date:'2026-10-26',time:'9:00 AM',priority:'Medium',done:false}],focusSessions:[]}));
  });const page=await context.newPage();await page.goto('http://127.0.0.1:8123/index.html');await ready(page);await expect(page.locator('#upcoming-rows')).toContainText('My existing coursework');await expect(page.locator('#tasks-list')).toContainText('My unfinished notes');await expect(page.locator('#tasks-list')).toContainText('09:00');await expect(page.locator('[data-stat="total"]')).toHaveText('1');await context.close();
});
