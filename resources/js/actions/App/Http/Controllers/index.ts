import Auth from './Auth'
import Admin from './Admin'
import Public from './Public'
import WhatsAppWebhookController from './WhatsAppWebhookController'
import Settings from './Settings'
import Api from './Api'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
Admin: Object.assign(Admin, Admin),
Public: Object.assign(Public, Public),
WhatsAppWebhookController: Object.assign(WhatsAppWebhookController, WhatsAppWebhookController),
Settings: Object.assign(Settings, Settings),
Api: Object.assign(Api, Api),
}

export default Controllers