module.exports = {
  apps: [
    {
      name: "2guys-api",
      instances: 1, // Or a number of instances
      script: './index.js',
      node_args: '-r dotenv/config',
      env: {
        "PORT": 3001,
        "NODE_ENV": "development",
        "BASE_URL": "http://localhost:3001/",
        "WEB_APP_BASE_URL": "http://192.168.68.101:3000/",
        "STRIPE_SECRET_KEY": "sk_test_51Kx3V4LLHpBosu5LfucpLZobpPnvJr3ohP4QefSf7uE0XmuwqJgKkrhnA9cP64y8oCZEczXfAfxfZGNFxkYJgmy800twhBSCAD",
      },
      env_staging: {
        "PORT": 3003,
        "NODE_ENV": "staging",
        "BASE_URL": "https://staging-api.2guys.app/",
        "WEB_APP_BASE_URL": "https://twoguys.app/",
        "STRIPE_SECRET_KEY": "sk_test_51Kx3V4LLHpBosu5LfucpLZobpPnvJr3ohP4QefSf7uE0XmuwqJgKkrhnA9cP64y8oCZEczXfAfxfZGNFxkYJgmy800twhBSCAD",
      },
      env_production: {
        "PORT": 3001,
        "NODE_ENV": "production",
        "BASE_URL": "https://staging-api.2guys.app/",
        "WEB_APP_BASE_URL": "https://twoguys.app/",
        "STRIPE_SECRET_KEY": "sk_test_51Kx3V4LLHpBosu5LfucpLZobpPnvJr3ohP4QefSf7uE0XmuwqJgKkrhnA9cP64y8oCZEczXfAfxfZGNFxkYJgmy800twhBSCAD",
      }
    },
  ]
}
