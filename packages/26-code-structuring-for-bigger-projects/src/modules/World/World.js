import Experience from '../Experience'
import Environment from '../Environment'
import Floor from '../Floor'
import Fox from '../Fox'

export default class World {
  constructor() {
    this.resources = Experience.default.resources

    this.resources.on('ready', () => {
      this.floor = new Floor()
      this.fox = new Fox()
      this.environment = new Environment()
    })
  }

  update() {
    if (this.fox) {
      this.fox.update()
    }
  }
}
