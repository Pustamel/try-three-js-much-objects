import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThreeSceneComponent } from './components/three-scene/three-scene.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ThreeSceneComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'threejs';
}
