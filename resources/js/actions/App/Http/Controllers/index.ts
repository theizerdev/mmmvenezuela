import Auth from './Auth'
import Admin from './Admin'
import Public from './Public'
import Settings from './Settings'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
Admin: Object.assign(Admin, Admin),
Public: Object.assign(Public, Public),
Settings: Object.assign(Settings, Settings),
}

export default Controllers