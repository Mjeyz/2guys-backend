const { ToadScheduler, SimpleIntervalJob, Task, AsyncTask } = require('toad-scheduler')
const {rotateSharedProxy} = require("./ProxidizeController")
const axios = require('axios').default;

const createRotateIpJob = (time, interval, proxyPort, proxyPass) => {
  const scheduler = new ToadScheduler()

  const task = new AsyncTask(
    'rotate shared IP',
    () => { 
      const endpoint = `${process.env.PROXIDIZE_URL}api/shared_proxy/rotate`

      return axios.get(endpoint, 
        { 
          headers: {"Authorization" : process.env.PROXIDIZE_TOKEN},
          params: {
            proxy_port: proxyPort,
            proxy_pass: proxyPass,
          }
        },
      ).then((result) => {
        console.info(result.data)
      }) },
    (error) => {
      console.info(error)
    }
  )

  const job = new SimpleIntervalJob(
    { [time]: interval }, 
    task,
    proxyPort, //task id
  )

  scheduler.addSimpleIntervalJob(job)


}


module.exports = {
  createRotateIpJob
}