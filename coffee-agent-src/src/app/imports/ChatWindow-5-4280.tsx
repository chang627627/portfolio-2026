import svgPaths from "./svg-mjlt8t30es";

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

function Paragraph2() {
  return (
    <div className="h-[24px] relative shrink-0 w-[94.961px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[94.961px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-0 not-italic text-[#041c33] text-[16px] text-nowrap top-[-1px] whitespace-pre">Availabilities</p>
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[18px] relative shrink-0 w-[55.93px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[18px] relative w-[55.93px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#8792a2] text-[12px] text-nowrap top-[0.5px] whitespace-pre">July 2024</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Paragraph2 />
      <Paragraph3 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[18px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#304050] text-[12px] text-nowrap top-[0.5px] whitespace-pre">Select a time that works for both of you</p>
    </div>
  );
}

function SchedulingView() {
  return (
    <div className="h-[50px] relative shrink-0 w-[364px]" data-name="SchedulingView">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[50px] items-start relative w-[364px]">
        <Container4 />
        <Paragraph4 />
      </div>
    </div>
  );
}

function Container5() {
  return <div className="absolute h-[32px] left-0 top-0 w-[40px]" data-name="Container" />;
}

function Paragraph5() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] left-[32.13px] not-italic text-[#8792a2] text-[11px] text-center text-nowrap top-[0.5px] translate-x-[-50%] uppercase whitespace-pre">MON</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[31.91px] not-italic text-[#041c33] text-[14px] text-center text-nowrap top-0 translate-x-[-50%] whitespace-pre">21</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex flex-col h-[37.5px] items-start left-[41px] top-0 w-[63.797px]" data-name="Container">
      <Paragraph5 />
      <Paragraph6 />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] left-[31.95px] not-italic text-[#8792a2] text-[11px] text-center text-nowrap top-[0.5px] translate-x-[-50%] uppercase whitespace-pre">TUE</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[31.92px] not-italic text-[#041c33] text-[14px] text-center text-nowrap top-0 translate-x-[-50%] whitespace-pre">22</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex flex-col h-[37.5px] items-start left-[105.8px] top-0 w-[63.797px]" data-name="Container">
      <Paragraph7 />
      <Paragraph8 />
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] left-[32.23px] not-italic text-[#8792a2] text-[11px] text-center text-nowrap top-[0.5px] translate-x-[-50%] uppercase whitespace-pre">WED</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[32.21px] not-italic text-[#041c33] text-[14px] text-center text-nowrap top-0 translate-x-[-50%] whitespace-pre">23</p>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex flex-col h-[37.5px] items-start left-[170.59px] top-0 w-[63.805px]" data-name="Container">
      <Paragraph9 />
      <Paragraph10 />
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] left-[32.18px] not-italic text-[#8792a2] text-[11px] text-center text-nowrap top-[0.5px] translate-x-[-50%] uppercase whitespace-pre">THU</p>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[32.27px] not-italic text-[#041c33] text-[14px] text-center text-nowrap top-0 translate-x-[-50%] whitespace-pre">24</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex flex-col h-[37.5px] items-start left-[235.4px] top-0 w-[63.797px]" data-name="Container">
      <Paragraph11 />
      <Paragraph12 />
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16.5px] left-[32.14px] not-italic text-[#8792a2] text-[11px] text-center text-nowrap top-[0.5px] translate-x-[-50%] uppercase whitespace-pre">FRI</p>
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-[31.91px] not-italic text-[#041c33] text-[14px] text-center text-nowrap top-0 translate-x-[-50%] whitespace-pre">25</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex flex-col h-[37.5px] items-start left-[300.19px] top-0 w-[63.797px]" data-name="Container">
      <Paragraph13 />
      <Paragraph14 />
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[37.5px] relative shrink-0 w-full" data-name="Container">
      <Container5 />
      <Container6 />
      <Container7 />
      <Container8 />
      <Container9 />
      <Container10 />
    </div>
  );
}

function Paragraph15() {
  return (
    <div className="absolute bg-white h-[36px] left-0 top-0 w-[40px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#8792a2] text-[10px] top-[3.5px] w-[16px]">9 AM</p>
    </div>
  );
}

function Button() {
  return <div className="absolute bg-white h-[36px] left-[41px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button1() {
  return <div className="absolute bg-white h-[36px] left-[105.4px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button2() {
  return <div className="absolute bg-white h-[36px] left-[169.8px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button3() {
  return <div className="absolute bg-white h-[36px] left-[234.19px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button4() {
  return <div className="absolute bg-white h-[36px] left-[298.59px] top-0 w-[63.406px]" data-name="Button" />;
}

function Container12() {
  return (
    <div className="h-[37px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d5dbe1] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Paragraph15 />
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function Paragraph16() {
  return (
    <div className="absolute bg-white h-[36px] left-0 top-0 w-[40px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#8792a2] text-[10px] top-[3.5px] w-[16px]">10 AM</p>
    </div>
  );
}

function Button5() {
  return <div className="absolute bg-[#9be8c5] h-[36px] left-[41px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button6() {
  return <div className="absolute bg-[#9be8c5] h-[36px] left-[105.4px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button7() {
  return <div className="absolute bg-[#e8f5ee] h-[36px] left-[169.8px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button8() {
  return <div className="absolute bg-[#9be8c5] h-[36px] left-[234.19px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button9() {
  return <div className="absolute bg-[#e8f5ee] h-[36px] left-[298.59px] top-0 w-[63.406px]" data-name="Button" />;
}

function Container13() {
  return (
    <div className="h-[37px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d5dbe1] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Paragraph16 />
      <Button5 />
      <Button6 />
      <Button7 />
      <Button8 />
      <Button9 />
    </div>
  );
}

function Paragraph17() {
  return (
    <div className="absolute bg-white h-[36px] left-0 top-0 w-[40px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#8792a2] text-[10px] top-[3.5px] w-[16px]">11 AM</p>
    </div>
  );
}

function Button10() {
  return <div className="absolute bg-[#e8f5ee] h-[36px] left-[41px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button11() {
  return <div className="absolute bg-[#9be8c5] h-[36px] left-[105.4px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button12() {
  return <div className="absolute bg-[#9be8c5] h-[36px] left-[169.8px] top-0 w-[63.398px]" data-name="Button" />;
}

function SchedulingView1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SchedulingView">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="SchedulingView">
          <path d={svgPaths.p39be50} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex h-[36px] items-center justify-center pl-0 pr-[0.008px] py-0 relative w-full">
          <SchedulingView1 />
        </div>
      </div>
    </div>
  );
}

function Button13() {
  return (
    <div className="absolute bg-[#635bff] content-stretch flex flex-col h-[36px] items-start left-[234.19px] top-0 w-[63.398px]" data-name="Button">
      <Container14 />
    </div>
  );
}

function Button14() {
  return <div className="absolute bg-[#9be8c5] h-[36px] left-[298.59px] top-0 w-[63.406px]" data-name="Button" />;
}

function Container15() {
  return (
    <div className="h-[37px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d5dbe1] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Paragraph17 />
      <Button10 />
      <Button11 />
      <Button12 />
      <Button13 />
      <Button14 />
    </div>
  );
}

function Paragraph18() {
  return (
    <div className="absolute bg-white h-[36px] left-0 top-0 w-[40px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#8792a2] text-[10px] top-[3.5px] w-[16px]">12 PM</p>
    </div>
  );
}

function Button15() {
  return <div className="absolute bg-white h-[36px] left-[41px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button16() {
  return <div className="absolute bg-white h-[36px] left-[105.4px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button17() {
  return <div className="absolute bg-white h-[36px] left-[169.8px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button18() {
  return <div className="absolute bg-white h-[36px] left-[234.19px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button19() {
  return <div className="absolute bg-[#9be8c5] h-[36px] left-[298.59px] top-0 w-[63.406px]" data-name="Button" />;
}

function Container16() {
  return (
    <div className="h-[37px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d5dbe1] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Paragraph18 />
      <Button15 />
      <Button16 />
      <Button17 />
      <Button18 />
      <Button19 />
    </div>
  );
}

function Paragraph19() {
  return (
    <div className="absolute bg-white h-[36px] left-0 top-0 w-[40px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#8792a2] text-[10px] text-nowrap top-[11px] whitespace-pre">1 PM</p>
    </div>
  );
}

function Button20() {
  return <div className="absolute bg-white h-[36px] left-[41px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button21() {
  return <div className="absolute bg-white h-[36px] left-[105.4px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button22() {
  return <div className="absolute bg-white h-[36px] left-[169.8px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button23() {
  return <div className="absolute bg-white h-[36px] left-[234.19px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button24() {
  return <div className="absolute bg-white h-[36px] left-[298.59px] top-0 w-[63.406px]" data-name="Button" />;
}

function Container17() {
  return (
    <div className="h-[37px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d5dbe1] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Paragraph19 />
      <Button20 />
      <Button21 />
      <Button22 />
      <Button23 />
      <Button24 />
    </div>
  );
}

function Paragraph20() {
  return (
    <div className="absolute bg-white h-[36px] left-0 top-0 w-[40px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#8792a2] text-[10px] top-[3.5px] w-[16px]">2 PM</p>
    </div>
  );
}

function Button25() {
  return <div className="absolute bg-[#e8f5ee] h-[36px] left-[41px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button26() {
  return <div className="absolute bg-[#e8f5ee] h-[36px] left-[105.4px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button27() {
  return <div className="absolute bg-[#9be8c5] h-[36px] left-[169.8px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button28() {
  return <div className="absolute bg-[#e8f5ee] h-[36px] left-[234.19px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button29() {
  return <div className="absolute bg-[#9be8c5] h-[36px] left-[298.59px] top-0 w-[63.406px]" data-name="Button" />;
}

function Container18() {
  return (
    <div className="h-[37px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d5dbe1] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Paragraph20 />
      <Button25 />
      <Button26 />
      <Button27 />
      <Button28 />
      <Button29 />
    </div>
  );
}

function Paragraph21() {
  return (
    <div className="absolute bg-white h-[36px] left-0 top-0 w-[40px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#8792a2] text-[10px] top-[3.5px] w-[16px]">3 PM</p>
    </div>
  );
}

function Button30() {
  return <div className="absolute bg-white h-[36px] left-[41px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button31() {
  return <div className="absolute bg-white h-[36px] left-[105.4px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button32() {
  return <div className="absolute bg-[#9be8c5] h-[36px] left-[169.8px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button33() {
  return <div className="absolute bg-white h-[36px] left-[234.19px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button34() {
  return <div className="absolute bg-white h-[36px] left-[298.59px] top-0 w-[63.406px]" data-name="Button" />;
}

function Container19() {
  return (
    <div className="h-[37px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#d5dbe1] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <Paragraph21 />
      <Button30 />
      <Button31 />
      <Button32 />
      <Button33 />
      <Button34 />
    </div>
  );
}

function Paragraph22() {
  return (
    <div className="absolute bg-white h-[36px] left-0 top-0 w-[40px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[8px] not-italic text-[#8792a2] text-[10px] top-[3.5px] w-[16px]">4 PM</p>
    </div>
  );
}

function Button35() {
  return <div className="absolute bg-white h-[36px] left-[41px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button36() {
  return <div className="absolute bg-white h-[36px] left-[105.4px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button37() {
  return <div className="absolute bg-white h-[36px] left-[169.8px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button38() {
  return <div className="absolute bg-white h-[36px] left-[234.19px] top-0 w-[63.398px]" data-name="Button" />;
}

function Button39() {
  return <div className="absolute bg-white h-[36px] left-[298.59px] top-0 w-[63.406px]" data-name="Button" />;
}

function Container20() {
  return (
    <div className="h-[36px] relative shrink-0 w-full" data-name="Container">
      <Paragraph22 />
      <Button35 />
      <Button36 />
      <Button37 />
      <Button38 />
      <Button39 />
    </div>
  );
}

function Container21() {
  return (
    <div className="bg-[#f6f8fa] h-[297px] relative rounded-[4px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex flex-col h-[297px] items-start p-px relative w-full">
          <Container12 />
          <Container13 />
          <Container15 />
          <Container16 />
          <Container17 />
          <Container18 />
          <Container19 />
          <Container20 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function SchedulingView2() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[364px]" data-name="SchedulingView">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-px h-full items-start overflow-clip relative rounded-[inherit] w-[364px]">
        <Container11 />
        <Container21 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="bg-[#9be8c5] relative rounded-[2px] shrink-0 size-[16px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[16px]" />
    </div>
  );
}

function Text() {
  return (
    <div className="basis-0 grow h-[16.5px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16.5px] relative w-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#304050] text-[11px] text-nowrap top-[0.5px] whitespace-pre">Both available</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[96.828px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[16.5px] items-center relative w-[96.828px]">
        <Container22 />
        <Text />
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="bg-[#e8f5ee] relative rounded-[2px] shrink-0 size-[16px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border size-[16px]" />
    </div>
  );
}

function Text1() {
  return (
    <div className="basis-0 grow h-[16.5px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16.5px] relative w-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#304050] text-[11px] text-nowrap top-[0.5px] whitespace-pre">Partial availability</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[114.5px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[8px] h-[16.5px] items-center relative w-[114.5px]">
        <Container24 />
        <Text1 />
      </div>
    </div>
  );
}

function SchedulingView3() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[364px]" data-name="SchedulingView">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[16px] h-[16.5px] items-center relative w-[364px]">
        <Container23 />
        <Container25 />
      </div>
    </div>
  );
}

function Paragraph23() {
  return (
    <div className="h-[18px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[18px] left-0 not-italic text-[#041c33] text-[12px] text-nowrap top-[0.5px] whitespace-pre">Responders (2)</p>
    </div>
  );
}

function Paragraph24() {
  return (
    <div className="h-[18px] relative shrink-0 w-[338px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[18px] relative w-[338px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#304050] text-[12px] text-nowrap top-[0.5px] whitespace-pre">Alex Chen</p>
      </div>
    </div>
  );
}

function Paragraph25() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[338px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full relative w-[338px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-0 not-italic text-[#304050] text-[12px] text-nowrap top-[0.5px] whitespace-pre">Ella Kim</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[40px] items-start relative shrink-0 w-full" data-name="Container">
      <Paragraph24 />
      <Paragraph25 />
    </div>
  );
}

function SchedulingView4() {
  return (
    <div className="bg-[#f6f8fa] h-[92px] relative rounded-[4px] shrink-0 w-[364px]" data-name="SchedulingView">
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[8px] h-[92px] items-start pb-px pt-[13px] px-[13px] relative w-[364px]">
        <Paragraph23 />
        <Container26 />
      </div>
    </div>
  );
}

function SchedulingView5() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="SchedulingView">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[21px] left-0 not-italic text-[#041c33] text-[14px] top-0 w-[208px]">Selected: THU July 24 @ 11 AM</p>
    </div>
  );
}

function Container27() {
  return (
    <div className="bg-[#f6f8fa] h-[47px] relative rounded-[4px] shrink-0 w-[364px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#635bff] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col h-[47px] items-start pb-px pt-[13px] px-[13px] relative w-[364px]">
        <SchedulingView5 />
      </div>
    </div>
  );
}

function SchedulingView6() {
  return (
    <div className="h-[20px] relative shrink-0 w-[90.391px]" data-name="SchedulingView">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[90.391px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[14px] text-nowrap text-white top-[0.5px] whitespace-pre">Confirm Time</p>
      </div>
    </div>
  );
}

function Button40() {
  return (
    <div className="bg-[#635bff] h-[32px] relative rounded-[4px] shrink-0 w-[364px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-[32px] items-center justify-center relative w-[364px]">
        <SchedulingView6 />
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[20px] h-[673px] items-start left-[22px] top-[91px] w-[364px]" data-name="Container">
      <SchedulingView />
      <SchedulingView2 />
      <SchedulingView3 />
      <SchedulingView4 />
      <Container27 />
      <Button40 />
    </div>
  );
}

export default function ChatWindow() {
  return (
    <div className="bg-white relative rounded-[8px] size-full" data-name="ChatWindow">
      <div aria-hidden="true" className="absolute border border-[#d5dbe1] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Container3 />
      <Container28 />
    </div>
  );
}