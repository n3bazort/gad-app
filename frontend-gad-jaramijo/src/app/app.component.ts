import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend-gad-jaramijo';

  ngOnInit() {
    fetch('http://localhost:3000/usuarios')
      .then(res => res.json())
      .then(data => {
        console.log("Usuarios recibidos desde backend:", data);
      })
      .catch(error => {
        console.error("Error al conectar con backend:", error);
      });
  }
}
