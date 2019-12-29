import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import styled from 'styled-components';

import { COLORS, BREAKPOINTS, EXTRA_WIDE_WIDTH } from '@constants';
import { interactWithCodeSample } from '@helpers/analytics.helpers';
import { syntaxTheme } from '@helpers/syntax-highlighting.helpers';

import FullWidth from '../FullWidth';
import MaxWidthWrapper from '../MaxWidthWrapper';
import TextLink from '../TextLink';
import DesktopOnly from '../DesktopOnly';
import MobileOnly from '../MobileOnly';

class LiveEditableCode extends PureComponent {
  static propTypes = {
    // `id` needed for analytics
    id: PropTypes.string.isRequired,
    // `gistId` needed for mobile, since we don't embed code on mobile.
    // (I haven't figured out how to make it a good experience :/)
    gistId: PropTypes.string,

    code: PropTypes.string.isRequired,
    scope: PropTypes.object,
    size: PropTypes.oneOf(['normal', 'extra-wide']),
    split: PropTypes.arrayOf(PropTypes.number),
    maxHeight: PropTypes.number,
  };

  static defaultProps = {
    split: [66, 34],
  };

  state = {
    hasBeenMounted: false,
  };

  componentDidMount() {
    // HACK - There's an issue with React-Live and SSR.
    // To avoid dealing with this issue for now, I'm just not rendering things
    // on the initial pass.
    this.setState({ hasBeenMounted: true });
  }

  trackChange = () => {
    // I'm not interested in how many tweaks the user makes,
    // I just wanna know if they interact with it at all.
    // So, stop recording after the first interaction.
    // (this is also to get around GA's throttling if you
    // fire too many events)
    if (!this.hasBeenTracked) {
      interactWithCodeSample({
        component: 'LiveEditableCode',
        label: this.props.id,
      });

      this.hasBeenTracked = true;
    }
  };

  render() {
    const { gistId, inline, code, scope, size, split, maxHeight } = this.props;
    const [leftSplit, rightSplit] = split;

    const maxWidth =
      size === 'extra-wide' ? `${EXTRA_WIDE_WIDTH}px` : undefined;

    const gistUrl = `https://gist.github.com/joshwcomeau/${gistId}`;

    if (!this.state.hasBeenMounted) {
      return null;
    }

    return (
      <LiveProvider
        code={code.trim()}
        scope={scope}
        noInline={!inline}
        theme={syntaxTheme}
      >
        <FullWidth>
          <Wrapper maxWidth={maxWidth}>
            <EditorWrapper
              split={leftSplit}
              maxHeight={maxHeight}
              onClick={this.trackChange}
            >
              <LiveEditor />
            </EditorWrapper>

            <PreviewWrapper split={rightSplit}>
              <LiveError />
              <LivePreview />
            </PreviewWrapper>

            <NotAvailableWrapper>
              Live-editable code not available on smaller screens.{' '}
              {gistId && <TextLink href={gistUrl}>View the gist</TextLink>}
            </NotAvailableWrapper>
          </Wrapper>
        </FullWidth>
      </LiveProvider>
    );
  }
}

const Wrapper = styled(MaxWidthWrapper)`
  display: flex;
  margin-top: 2rem;
  margin-bottom: 72px;

  @media ${BREAKPOINTS.md} {
    flex-direction: column;
  }
`;

const EditorWrapper = styled(DesktopOnly)`
  padding: 16px;
  flex: ${props => props.split};
  background: #f8f8f8;
  max-height: ${props => props.maxHeight}px;
  overflow: auto;
`;

const NotAvailableWrapper = styled(MobileOnly)`
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: ${COLORS.gray[50]};
  padding: 25px;
  text-align: center;
`;

const PreviewWrapper = styled.div`
  padding: 16px;
  flex: ${props => props.split};
  background: #f8f8f8;

  @media ${BREAKPOINTS.md} {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  @media ${BREAKPOINTS.mdMin} {
    border-left: 1px solid rgba(0, 0, 0, 0.1);
  }
`;

export default LiveEditableCode;
