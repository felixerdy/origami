import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./start/start.module').then(m => m.StartPageModule) },
  { path: 'play-game/games-overview', loadChildren: () => import('./pages/play-game/games-overview/games-overview.module').then(m => m.GamesOverviewPageModule) },
  { path: 'play-game/play-game-list', loadChildren: () => import('./pages/play-game/play-game-list/play-game-list.module').then(m => m.PlayGameListPageModule) },
  { path: 'play-game/game-detail/:id', loadChildren: () => import('./pages/play-game/game-detail/game-detail.module').then(m => m.GameDetailPageModule) },
  { path: 'play-game/playing-game/:id', loadChildren: () => import('./pages/play-game/playing-game/playing-game.module').then(m => m.PlayingGamePageModule) },
  { path: 'create-game', loadChildren: () => import('./pages/create-game/create-game/create-game.module').then(m => m.CreateGamePageModule) },
  { path: 'create-game/create-game-overview', loadChildren: () => import('./pages/create-game/create-game-overview/create-game-overview.module').then(m => m.CreateGameOverviewPageModule) },
  { path: 'create-game/create-game-list', loadChildren: () => import('./pages/create-game/create-game-list/create-game-list.module').then(m => m.CreateGameListPageModule) },
  { path: 'create-game/create-game-map', loadChildren: () => import('./pages/create-game/create-game-map/create-game-map.module').then(m => m.CreateGameMapPageModule) },
  { path: 'edit-game', loadChildren: () => import('./pages/edit-game/edit-game-list/edit-game-list.module').then(m => m.EditGameListPageModule) },
  { path: 'edit-game/:id', loadChildren: () => import('./pages/edit-game/edit-game-overview/edit-game-list.module').then(m => m.EditGameListPageModule) },
  { path: 'analyze', loadChildren: () => import('./pages/analyze-game/analyze-game-list/analyze-game-list.module').then(m => m.AnalyzeGameListPageModule) },
  // older stuff
  // { path: 'map-swipe', loadChildren: './map-swipe/map-swipe.module#MapSwipePageModule' },
  { path: 'start', loadChildren: () => import('./start/start.module').then(m => m.StartPageModule) },
  { path: 'map-showroom', loadChildren: () => import('./pages/showroom/map-showroom/map-showroom.module').then(m => m.MapShowroomPageModule) },
  { path: 'info', loadChildren: () => import('./pages/info/info.module').then(m => m.InfoPageModule) },
  { path: 'showroom', loadChildren: () => import('./pages/showroom/showroom/showroom.module').then(m => m.ShowroomPageModule) },
  { path: 'task-showroom', loadChildren: () => import('./pages/showroom/task-showroom/task-showroom.module').then(m => m.TaskShowroomPageModule) },
  {
    path: 'ibeacon',
    loadChildren: () => import('./pages/ibeacon/ibeacon.module').then( m => m.IbeaconPageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
