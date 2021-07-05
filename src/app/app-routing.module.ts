import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth-gard.service';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./start/start.module').then((m) => m.StartPageModule),
  },
  {
    path: 'play-game/games-overview',
    loadChildren: () =>
      import('./pages/play-game/games-overview/games-overview.module').then(
        (m) => m.GamesOverviewPageModule
      ),
  },
  {
    path: 'play-game/play-game-list/:worldType',
    loadChildren: () =>
      import('./pages/play-game/play-game-list/play-game-list.module').then(
        (m) => m.PlayGameListPageModule
      ),
  },
  {
    path: 'play-game/game-detail/:id',
    loadChildren: () =>
      import('./pages/play-game/game-detail/game-detail.module').then(
        (m) => m.GameDetailPageModule
      ),
  },
  {
    path: 'play-game/playing-game/:bundle',
    loadChildren: () =>
      import('./pages/play-game/playing-game/playing-game.module').then(
        (m) => m.PlayingGamePageModule
      ),
  },
  {
    path: 'create-game',
    loadChildren: () =>
      import('./pages/create-game/create-game/create-game.module').then(
        (m) => m.CreateGamePageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'create-game/create-game-overview/:bundle',
    loadChildren: () =>
      import(
        './pages/create-game/create-game-overview/create-game-overview.module'
      ).then((m) => m.CreateGameOverviewPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'create-game/create-game-list',
    loadChildren: () =>
      import(
        './pages/create-game/create-game-list/create-game-list.module'
      ).then((m) => m.CreateGameListPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'create-game/create-game-map',
    loadChildren: () =>
      import('./pages/create-game/create-game-map/create-game-map.module').then(
        (m) => m.CreateGameMapPageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'edit-game-list/:worldType',
    loadChildren: () =>
      import('./pages/edit-game/edit-game-list/edit-game-list.module').then(
        (m) => m.EditGameListPageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'edit-game/:id',
    loadChildren: () =>
      import('./pages/edit-game/edit-game-tasks/edit-game-list.module').then(
        (m) => m.EditGameListPageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'edit-game/edit-game-overview/:id',
    loadChildren: () =>
      import(
        './pages/edit-game/edit-game-overview/edit-game-overview.module'
      ).then((m) => m.EditGameOverviewPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'analyze',
    loadChildren: () =>
      import(
        './pages/analyze-game/analyze-game-list/analyze-game-list.module'
      ).then((m) => m.AnalyzeGameListPageModule),
  },
  {
    path: 'user/login',
    loadChildren: () =>
      import('./pages/user/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'user/register',
    loadChildren: () =>
      import('./pages/user/register/register.module').then(
        (m) => m.RegisterPageModule
      ),
  },
  {
    path: 'user/profile',
    loadChildren: () =>
      import('./pages/user/profile/profile.module').then(
        (m) => m.ProfilePageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'user/forgot-password',
    loadChildren: () =>
      import('./pages/user/forgot-password/forgot-password.module').then(
        (m) => m.ForgotPasswordPageModule
      ),
  },
  {
    path: 'user/reset-password',
    loadChildren: () =>
      import('./pages/user/reset-password/reset-password.module').then(
        (m) => m.ResetPasswordPageModule
      ),
  },
  // older stuff
  // { path: 'map-swipe', loadChildren: './map-swipe/map-swipe.module#MapSwipePageModule' },
  {
    path: 'start',
    loadChildren: () =>
      import('./start/start.module').then((m) => m.StartPageModule),
  },
  {
    path: 'map-showroom',
    loadChildren: () =>
      import('./pages/showroom/map-showroom/map-showroom.module').then(
        (m) => m.MapShowroomPageModule
      ),
  },
  {
    path: 'info',
    loadChildren: () =>
      import('./pages/info/info.module').then((m) => m.InfoPageModule),
  },
  {
    path: 'showroom',
    loadChildren: () =>
      import('./pages/showroom/showroom/showroom.module').then(
        (m) => m.ShowroomPageModule
      ),
  },
  {
    path: 'task-showroom',
    loadChildren: () =>
      import('./pages/showroom/task-showroom/task-showroom.module').then(
        (m) => m.TaskShowroomPageModule
      ),
  },
  {
    path: 'create-game-menu',
    loadChildren: () => import('./pages/create-game/create-game-menu/create-game-menu.module').then( m => m.CreateGameMenuPageModule)
  },
  {
    path: 'create-game-virtual',
    loadChildren: () => import('./pages/create-game/create-game-virtual/create-game-virtual.module').then( m => m.CreateGameVirtualPageModule)
  },
  {
    path: 'create-game-virtual-list/:VR_version',
    loadChildren: () => import('./pages/create-game/create-game-virtual-list/create-game-virtual-list.module').then( m => m.CreateGameVirtualListPageModule)
  },
  {
    path: 'play-game/play-game-menu',
    loadChildren: () => import('./pages/play-game/play-game-menu/play-game-menu.module').then( 
      m => m.PlayGameMenuPageModule)
  },
  {
    path: 'create-game-virtual-menu',
    loadChildren: () => import('./pages/create-game/create-game-virtual-menu/create-game-virtual-menu.module').then( m => m.CreateGameVirtualMenuPageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
