import { patch } from 'node_modules/axios/index.cjs';
import { Component } from 'react';
import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    {
      path: '/',
      component: '@/pages/index', // Cấu hình trang index.tsx
      routes: [
        {
          path: '/register',
          component: '@/pages/register', // Trang đăng ký
        },
        {
          path: '/login',
          component: '@/pages/login', // Trang đăng nhập
        },
        {
          path: '/',
          component: '@/pages/home', // Trang danh sách câu hỏi
        },
        {
          path: '/post-question',
          component: '@/pages/postQuestion', // Trang đăng bài
        },
        {
          path: 'questions/:id',
          component: '@/pages/questions', // Trang chi tiết câu hỏi
        },
        {
          path: '/search',
          component: '@/pages/search',
        },
        {
          path: '/admin',
          component: '@/pages/admin/AdminDashboard', // Trang quản trị viên
        }
      ],
    },
  ],
});
