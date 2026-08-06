import svgPaths from "./svg-te1azntojf";
import imgImageEllaKim from "figma:asset/d56aaa0b5b0d6767c6dae1e50d0d43d6a7767346.png";

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p2c2f98a0} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-gradient-to-b from-[#7c75ff] relative rounded-[1.67772e+07px] shrink-0 size-[30px] to-[#635bff]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[30px]">
        <Icon />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#041c33] text-[16px] text-nowrap top-[-1px] whitespace-pre">Luna</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#304050] text-[14px] text-nowrap top-0 whitespace-pre">Your Coffee Chat Assistant</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="basis-0 grow h-[45px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[45px] items-start relative w-full">
        <Paragraph />
        <Paragraph1 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[45px] relative shrink-0 w-[220.82px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[45px] items-center relative w-[220.82px]">
        <Container />
        <Container1 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-[#f6f8fa] box-border content-stretch flex h-[69px] items-center left-px pb-px pl-[21px] pr-0 pt-0 rounded-tl-[8px] rounded-tr-[8px] top-px w-[406px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d5dbe1] border-[0px_0px_1px] border-solid inset-0 pointer-events-none rounded-tl-[8px] rounded-tr-[8px]" />
      <Container2 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_5_4136)" id="Icon">
          <path d={svgPaths.p3f4a7a0} fill="var(--fill-0, #FF9900)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_5_4136">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[18px] relative shrink-0 w-[324.055px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[18px] relative w-[324.055px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#041c33] text-[14px] text-nowrap top-[0.5px] whitespace-pre">Please schedule this chat by Wednesday, Sep 20</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[18px] relative shrink-0 w-[364px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[12px] h-[18px] items-center relative w-[364px]">
        <Icon1 />
        <Paragraph2 />
      </div>
    </div>
  );
}

function AiAgent() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="AIAgent">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="AIAgent">
          <path d={svgPaths.p8c9ab00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-gradient-to-b from-[#7c75ff] relative rounded-[1.67772e+07px] shrink-0 size-[40px] to-[#635bff]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[40px]">
        <AiAgent />
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#041c33] text-[14px] top-[0.5px] w-[259px]">Hey Alex! Ready to meet someone new from Product Design this week?</p>
    </div>
  );
}

function ChatMessage() {
  return (
    <div className="basis-0 bg-[#f6f8fa] grow h-[66px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="ChatMessage">
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[66px] items-start pb-px pt-[13px] px-[17px] relative w-full">
          <Paragraph3 />
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[66px] items-start left-0 top-0 w-[364px]" data-name="Container">
      <Container5 />
      <ChatMessage />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-nowrap text-white top-[0.5px] whitespace-pre">Sounds great!</p>
    </div>
  );
}

function ChatMessage1() {
  return (
    <div className="absolute bg-[#635bff] box-border content-stretch flex flex-col h-[44px] items-start left-[239.91px] pb-0 pt-[12px] px-[16px] rounded-[8px] top-[82px] w-[124.094px]" data-name="ChatMessage">
      <Paragraph4 />
    </div>
  );
}

function AiAgent1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="AIAgent">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="AIAgent">
          <path d={svgPaths.p8c9ab00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-gradient-to-b from-[#7c75ff] relative rounded-[1.67772e+07px] shrink-0 size-[40px] to-[#635bff]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-center justify-center relative size-[40px]">
        <AiAgent1 />
      </div>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[60px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#041c33] text-[14px] top-[0.5px] w-[262px]">Awesome! I found someone who shares your interest in creative work. Meet Ella Kim from Product Design.</p>
    </div>
  );
}

function ChatMessage2() {
  return (
    <div className="basis-0 bg-[#f6f8fa] grow h-[86px] min-h-px min-w-px relative rounded-[8px] shrink-0" data-name="ChatMessage">
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[86px] items-start pb-px pt-[13px] px-[17px] relative w-full">
          <Paragraph5 />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[86px] items-start left-0 top-[142px] w-[364px]" data-name="Container">
      <Container7 />
      <ChatMessage2 />
    </div>
  );
}

function Container9() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[364px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[364px]">
        <Container6 />
        <ChatMessage1 />
        <Container8 />
      </div>
    </div>
  );
}

function ImageEllaKim() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Image (Ella Kim)">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImageEllaKim} />
    </div>
  );
}

function Container10() {
  return (
    <div className="relative rounded-[1.67772e+07px] shrink-0 size-[48px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-[48px]">
        <ImageEllaKim />
      </div>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#041c33] text-[16px] text-nowrap top-[-1px] whitespace-pre">Ella Kim</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#304050] text-[14px] text-nowrap top-0 whitespace-pre">Product Designer</p>
    </div>
  );
}

function Container11() {
  return (
    <div className="basis-0 grow h-[45px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[45px] items-start relative w-full">
        <Paragraph6 />
        <Paragraph7 />
      </div>
    </div>
  );
}

function MatchProfileCard() {
  return (
    <div className="content-stretch flex gap-[12px] h-[48px] items-center relative shrink-0 w-full" data-name="MatchProfileCard">
      <Container10 />
      <Container11 />
    </div>
  );
}

function Container12() {
  return (
    <div className="bg-white h-[82px] relative rounded-[8px] shrink-0 w-[364px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[82px] items-start pb-px pt-[17px] px-[17px] relative w-[364px]">
        <MatchProfileCard />
      </div>
    </div>
  );
}

function SuggestionCards() {
  return (
    <div className="absolute h-[36px] left-[42px] top-[14px] w-[308px]" data-name="SuggestionCards">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#304050] text-[14px] top-[0.5px] w-[297px]">You both have creative roles - Marketing and Product Design</p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <path d={svgPaths.p30769300} fill="var(--fill-0, #635BFF)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[34.38%_29.17%_37.5%_29.17%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-11.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 6">
            <path d={svgPaths.p37712500} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SuggestionCards1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[14px] overflow-clip size-[16px] top-[14px]" data-name="SuggestionCards">
      <Icon2 />
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-white h-[54px] relative rounded-[4px] shrink-0 w-[364px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[54px] relative w-[364px]">
        <SuggestionCards />
        <SuggestionCards1 />
      </div>
    </div>
  );
}

function SuggestionCards2() {
  return (
    <div className="absolute h-[36px] left-[42px] top-[14px] w-[308px]" data-name="SuggestionCards">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#304050] text-[14px] top-[0.5px] w-[301px]">You can discuss design trends, branding, and creative strategies</p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <path d={svgPaths.p30769300} fill="var(--fill-0, #635BFF)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[34.38%_29.17%_37.5%_29.17%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-11.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 6">
            <path d={svgPaths.p37712500} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SuggestionCards3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[14px] overflow-clip size-[16px] top-[14px]" data-name="SuggestionCards">
      <Icon3 />
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-white h-[54px] relative rounded-[4px] shrink-0 w-[364px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[54px] relative w-[364px]">
        <SuggestionCards2 />
        <SuggestionCards3 />
      </div>
    </div>
  );
}

function SuggestionCards4() {
  return (
    <div className="absolute h-[36px] left-[42px] top-[14px] w-[308px]" data-name="SuggestionCards">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#304050] text-[14px] top-[0.5px] w-[274px]">{`Ella's user-centered design approach can inspire your marketing campaigns`}</p>
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-0" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <path d={svgPaths.p30769300} fill="var(--fill-0, #635BFF)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[34.38%_29.17%_37.5%_29.17%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-11.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 6">
            <path d={svgPaths.p37712500} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SuggestionCards5() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[14px] overflow-clip size-[16px] top-[14px]" data-name="SuggestionCards">
      <Icon4 />
    </div>
  );
}

function Container15() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[4px] shrink-0 w-[364px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[364px]">
        <SuggestionCards4 />
        <SuggestionCards5 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[186px] relative shrink-0 w-[364px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[12px] h-[186px] items-start relative w-[364px]">
        <Container13 />
        <Container14 />
        <Container15 />
      </div>
    </div>
  );
}

function MatchConfirmation() {
  return (
    <div className="h-[21px] relative shrink-0 w-[364px]" data-name="MatchConfirmation">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[21px] relative w-[364px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[182.45px] not-italic text-[#304050] text-[14px] text-center text-nowrap top-0 translate-x-[-50%] whitespace-pre">Would you like to schedule a chat with Ella?</p>
      </div>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[20px] relative shrink-0 w-[122.023px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[122.023px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-nowrap text-white top-[0.5px] whitespace-pre">Schedule with Ella</p>
      </div>
    </div>
  );
}

function MatchConfirmation1() {
  return (
    <div className="bg-[#635bff] h-[32px] relative rounded-[4px] shrink-0 w-[364px]" data-name="MatchConfirmation">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[32px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-[364px]">
        <Paragraph8 />
      </div>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[20px] relative shrink-0 w-[139.32px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[139.32px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#8792a2] text-[14px] text-nowrap top-[0.5px] whitespace-pre">Show another option</p>
      </div>
    </div>
  );
}

function MatchConfirmation2() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[4px] shrink-0 w-[364px]" data-name="MatchConfirmation">
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-full items-center justify-center pl-px pr-[1.008px] py-px relative w-[364px]">
        <Paragraph9 />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="h-[117px] relative shrink-0 w-[364px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[20px] h-[117px] items-start relative w-[364px]">
        <MatchConfirmation />
        <MatchConfirmation1 />
        <MatchConfirmation2 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[727px] items-start left-[22px] top-[91px] w-[364px]" data-name="Container">
      <Container4 />
      <Container9 />
      <Container12 />
      <Container16 />
      <Container17 />
    </div>
  );
}

function ChatWindow() {
  return (
    <div className="bg-white h-[840px] relative rounded-[8px] shrink-0 w-[408px]" data-name="ChatWindow">
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[840px] relative w-[408px]">
        <Container3 />
        <Container18 />
      </div>
    </div>
  );
}

export default function ConversationalAiAssistantDesign() {
  return (
    <div className="bg-[#f6f8fa] content-stretch flex items-center justify-center relative size-full" data-name="Conversational AI Assistant Design">
      <ChatWindow />
    </div>
  );
}