import activities from './activities'
import database from './database'
import logs from './logs'
import queues from './queues'
import registration from './registration'
import server from './server'
import sessions from './sessions'
import tasks from './tasks'
const monitoring = {
    activities: Object.assign(activities, activities),
database: Object.assign(database, database),
logs: Object.assign(logs, logs),
queues: Object.assign(queues, queues),
registration: Object.assign(registration, registration),
server: Object.assign(server, server),
sessions: Object.assign(sessions, sessions),
tasks: Object.assign(tasks, tasks),
}

export default monitoring