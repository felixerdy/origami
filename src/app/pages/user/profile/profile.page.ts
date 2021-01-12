import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth-service.service';
import { Validators, FormBuilder } from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  loginForm;
  error: string;
  register;

  user;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public navCtrl: NavController
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUserValue();

    this.loginForm = this.fb.group({
      username: [this.authService.getUserValue().username],
      email: [this.authService.getUserValue().email],
    });

    this.authService.getErrorMessage().subscribe((e) => {
      this.error = e;
    });

    this.authService.getRegisterStatus().subscribe((r) => {
      this.register = r;
    });
  }

  updateUser() { }

  logout() {
    this.authService.logout();
  }

  navigateRegister() {
    this.navCtrl.navigateForward('user/register');
  }
}
