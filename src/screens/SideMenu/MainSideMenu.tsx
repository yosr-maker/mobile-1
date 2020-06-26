import React, { Fragment, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import FAB from 'react-native-fab';
import { ThemeContext } from 'styled-components/native';
import { ContentType, SNTag } from 'snjs';
import {
  MainSafeAreaView,
  FirstSafeAreaView,
  SideMenuSectionContainer,
} from './MainSideMenu.styled';
import { SideMenuHero } from './SideMenuHero';
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleKit } from '@Style/StyleKit';
import { ICON_SETTINGS } from '@Style/icons';
import { SideMenuSection } from './SideMenuSection';
import { ApplicationContext } from '@Root/ApplicationContext';
// import { useCustomActionSheet } from '@Style/useCustomActionSheet';
import { TagSelectionList } from './TagSelectionList';
import { AppStateType } from '@Lib/ApplicationState';
import { useNavigation } from '@react-navigation/native';
import { SCREEN_SETTINGS } from '@Root/screens2/screens';
import DrawerLayout from 'react-native-gesture-handler/DrawerLayout';

type Props = {
  drawerRef: DrawerLayout | null;
};

export const MainSideMenu = ({ drawerRef }: Props): JSX.Element => {
  // Context
  const theme = useContext(ThemeContext);
  const application = useContext(ApplicationContext);
  const navigation = useNavigation();

  // const { showActionSheet } = useCustomActionSheet();
  // State
  const [selectedTag, setSelectedTag] = useState(() =>
    application!.getAppState().getSelectedTag()
  );

  useEffect(() => {
    const removeTagChangeObserver = application!
      .getAppState()
      .addStateChangeObserver(state => {
        if (state === AppStateType.TagChanged) {
          setSelectedTag(application!.getAppState().getSelectedTag());
        }
      });
    return removeTagChangeObserver;
  });

  const outOfSyncPressed = () => {
    application!.alertService!.confirm(
      "We've detected that the data in the current application session may not match the data on the server. This can happen due to poor network conditions, or if a large note fails to download on your device. To resolve this issue, we recommend first creating a backup of your data in the Settings screen, the signing out of your account and signing back in.",
      'Potentially Out of Sync',
      'Open Settings',
      undefined,
      () => {} // TODO: nav open settings
    );
  };
  const onTagSelect = async (tag: SNTag) => {
    if (tag.conflictOf) {
      application!.changeAndSaveItem(tag.uuid, mutator => {
        mutator.conflictOf = undefined;
      });
    }
    application!.getAppState().setSelectedTag(tag);
  };

  const openSettings = () => {
    drawerRef?.closeDrawer();
    navigation?.navigate(SCREEN_SETTINGS);
  };

  return (
    <Fragment>
      <FirstSafeAreaView />
      <MainSafeAreaView edges={['bottom', 'left']}>
        <SideMenuHero
          testID="settingsButton"
          onPress={openSettings} // TODO: nav open settings
          onOutOfSyncPress={outOfSyncPressed}
        />

        <SideMenuSectionContainer
          data={[
            <SideMenuSection title="Views" key="views-section">
              <TagSelectionList
                key="views-section-list"
                contentType={ContentType.SmartTag}
                onTagSelect={onTagSelect}
                selectedTag={selectedTag}
              />
            </SideMenuSection>,

            <SideMenuSection title="Tags" key="tags-section">
              <TagSelectionList
                key="tags-section-list"
                hasBottomPadding={Platform.OS === 'android'}
                emptyPlaceholder={'No tags. Create one from the note composer.'}
                contentType={ContentType.Tag}
                onTagSelect={onTagSelect}
                selectedTag={selectedTag}
              />
            </SideMenuSection>,
          ]}
          // @ts-expect-error
          renderItem={({ item }) => item}
        />

        <FAB
          buttonColor={theme.stylekitInfoColor}
          iconTextColor={theme.stylekitInfoContrastColor}
          onClickAction={openSettings}
          visible={true}
          size={29}
          paddingTop={Platform.OS ? 2 : 0}
          iconTextComponent={
            <Icon name={StyleKit.nameForIcon(ICON_SETTINGS)} />
          }
        />
      </MainSafeAreaView>
    </Fragment>
  );
};