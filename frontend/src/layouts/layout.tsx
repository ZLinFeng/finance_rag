import { UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React from 'react';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate } from 'umi';

const {Content, Sider} = Layout; 

type MenuItem = Required<MenuProps>['items'][number];

const menus: MenuItem[] = [
  {
    key: 'ner',
    icon: <UserOutlined />,
    label: '金融命名实体识别',
  },
  {
    key: 'std',
    icon: <VideoCameraOutlined />,
    label: '金融术语标准化',
  }
]

const App: React.FC = () => {

  const navigate = useNavigate();

  const onClick: MenuProps["onClick"] = (e) => {
    console.log('click ', e);
    navigate(e.key);
  }

  return (
    <Layout className="h-screen">
      <Sider
        breakpoint="lg"
        className="bg-white"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className="h-[100px] flex justify-center items-center">
          <span className="text-xl font-italic">
            金融工具箱
          </span>
        </div>
        <Menu className="h-full" mode="inline" items={menus} onClick={onClick} />
          
      </Sider>
      <Layout>
        <Content>
          <div className='h-full w-full'>
            <Outlet />
          </div>
      </Content>
      </Layout>
    </Layout>
  );
};

export default App;
