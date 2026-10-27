const {defineConfig,devices}=require('@playwright/test');
const projects=[{name:'chromium',use:{...devices['Desktop Chrome']}},{name:'firefox',use:{...devices['Desktop Firefox']}}];
if(process.env.TEST_EDGE)projects.push({name:'edge',use:{...devices['Desktop Edge'],channel:'msedge'}});
if(process.env.TEST_CHROME)projects.push({name:'chrome',use:{...devices['Desktop Chrome'],channel:'chrome'}});
module.exports=defineConfig({testDir:'tests/browser',fullyParallel:false,workers:process.env.CI ? 2 : 2,retries:process.env.CI ? 1 : 0,timeout:30000,
  reporter:[['list'],['html',{open:'never'}],['json',{outputFile:'test-results/browser-results.json'}]],
  use:{baseURL:'http://127.0.0.1:8123',timezoneId:'Asia/Kuala_Lumpur',trace:'retain-on-failure',screenshot:'only-on-failure'},
  webServer:{command:'node scripts/serve.cjs --port 8123',url:'http://127.0.0.1:8123',reuseExistingServer:false},projects});
